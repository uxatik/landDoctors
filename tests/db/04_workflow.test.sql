-- Task 4: case workflow — transitions, assignment rules, offers, manual payment, refund.

insert into auth.users (id, email) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'ops@example.com'),
  ('aaaaaaaa-0000-0000-0000-000000000002', 'admin@example.com');
insert into public.staff (user_id, name, role) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Ops Brother', 'operations'),
  ('aaaaaaaa-0000-0000-0000-000000000002', 'Founder', 'super_admin');

insert into public.packages (slug, name_bn, name_en, scope_bn, scope_en, delivery_days, base_price, consultant_share_pct, field_work, price_confirmed)
values
  ('session-30', '৩০ মিনিট পরামর্শ', '30-minute session', 'ফোনে পরামর্শ', 'Phone advice', 0, 1000, 80, false, true),
  ('land-health-report', 'ল্যান্ড হেলথ রিপোর্ট', 'Land health report', 'দলিল যাচাই', 'Deed check', 7, 8000, 70, true, false);

insert into public.consultants (name, role, phone, verified, active, areas, upazilas, conflict_upazilas, employment_status, sanction_ref, is_demo)
values
  ('Good Private',   'surveyor', '+8801700000001', true,  true,  '{savar,gazipur}', '{Savar,Ashulia}', '{Dhamrai}', 'private', null, false),        -- id 1
  ('Unverified',     'surveyor', '+8801700000002', false, true,  '{savar}', '{Savar}', '{}', 'private', null, false),                              -- id 2
  ('Inactive',       'surveyor', '+8801700000003', true,  false, '{savar}', '{Savar}', '{}', 'private', null, false),                              -- id 3
  ('Government',     'surveyor', '+8801700000004', true,  true,  '{savar}', '{Savar}', '{}', 'government_sanctioned', 'MoL/2026/17', false),       -- id 4
  ('Conflicted',     'surveyor', '+8801700000005', true,  true,  '{savar}', '{Savar}', '{Savar}', 'private', null, false),                         -- id 5
  ('Demo Person',    'surveyor', '+8801700000006', true,  true,  '{savar}', '{Savar}', '{}', 'private', null, true),                               -- id 6
  ('Gazipur Only',   'surveyor', '+8801700000007', true,  true,  '{gazipur}', '{Kaliakair}', '{}', 'private', null, false);                       -- id 7

insert into public.cases (category, area, upazila, customer_name, customer_phone, contact_pref)
values
  ('pre_purchase_check', 'savar', 'Savar', 'Nasrin', '+8801712345678', 'call'),     -- id 1
  ('mutation', 'savar', 'Savar', 'Karim', '+8801812345678', 'whatsapp');            -- id 2

-- Anonymous visitors and non-staff cannot use workflow functions.
select test.as_user('anon');
select test.throws($$select public.change_case_status(1, 'triage_done', null)$$, 'permission denied', 'anon cannot change status');
reset role;
select test.as_user('authenticated', 'aaaaaaaa-0000-0000-0000-000000000001', 'aal1');
select test.throws($$select public.change_case_status(1, 'triage_done', null)$$, 'not_authorised', 'aal1 cannot change status');
reset role;

-- Operations, verified.
select test.as_user('authenticated', 'aaaaaaaa-0000-0000-0000-000000000001', 'aal2');

-- Transitions.
select test.throws($$select public.change_case_status(1, 'paid', null)$$, 'invalid_transition', 'new → paid blocked');
select test.throws($$select public.change_case_status(1, 'offer_sent', null)$$, 'invalid_transition', 'offer_sent only via create_offer');
select public.change_case_status(1, 'triage_done', 'Called, wants land check');
select test.throws($$select public.change_case_status(1, 'in_progress', null)$$, 'invalid_transition', 'triage_done → in_progress blocked');

-- Assignment rules.
select test.throws($$select public.assign_consultant(1, 2)$$, 'consultant_not_eligible', 'unverified blocked');
select test.throws($$select public.assign_consultant(1, 3)$$, 'consultant_not_eligible', 'inactive blocked');
select test.throws($$select public.assign_consultant(1, 4)$$, 'consultant_not_eligible', 'government blocked in phase 1');
select test.throws($$select public.assign_consultant(1, 5)$$, 'conflict_of_interest', 'conflict upazila blocked');
select test.throws($$select public.assign_consultant(1, 6)$$, 'consultant_not_eligible', 'demo blocked');
select test.throws($$select public.assign_consultant(1, 7)$$, 'outside_consultant_area', 'field work needs area coverage');
select public.assign_consultant(1, 1);

-- Offers: operations cannot change the price.
select test.throws($$select public.create_offer(1, 2, 9000, 240, 'Certified copies')$$, 'not_authorised:price', 'ops cannot change price');
select test.eq(char_length(public.create_offer(1, 2, null, 240, 'Certified copies')) >= 32, true, 'offer token issued');
select test.throws($$select public.create_offer(1, 2, null, 0, '')$$, 'invalid_status', 'second offer blocked while one is open');
reset role;

select test.eq((select status::text from public.cases where id = 1), 'offer_sent', 'case moved to offer_sent');
select test.eq((select service_price from public.offers where case_id = 1), 8000, 'price snapshot');

-- The offer keeps its price after the package price changes.
update public.packages set base_price = 9500 where slug = 'land-health-report';
select token as t1 from public.offers where case_id = 1 \gset
select test.as_user('anon');
select test.eq(
  (select row(service_price, govt_fees, state)::text from public.get_offer(:'t1')),
  '(8000,240,price_unconfirmed)', 'offer shows snapshot price; unconfirmed price flagged');
select test.eq((select count(*)::int from public.get_offer('does-not-exist-000000000000000000000')), 0, 'unknown token → no rows');
reset role;

-- A confirmed-price offer is open; expired offers say so.
select test.as_user('authenticated', 'aaaaaaaa-0000-0000-0000-000000000001', 'aal2');
select public.change_case_status(2, 'triage_done', null);
select public.assign_consultant(2, 7);  -- phone session: area coverage not required
select public.create_offer(2, 1, null, 0, '');
reset role;
select token as t2 from public.offers where case_id = 2 \gset
select test.as_user('anon');
select test.eq((select state from public.get_offer(:'t2')), 'open', 'confirmed offer open');
reset role;
update public.offers set expires_at = now() - interval '1 minute' where case_id = 2;
select test.as_user('anon');
select test.eq((select state from public.get_offer(:'t2')), 'expired', 'expired offer');
select test.throws($$select customer_phone from public.get_offer('x')$$, 'customer_phone', 'offer never exposes phone');
reset role;
update public.offers set expires_at = now() + interval '7 days' where case_id = 2;

-- Manual payment must match the offer total, and only once.
select test.as_user('authenticated', 'aaaaaaaa-0000-0000-0000-000000000001', 'aal2');
select test.throws($$select public.record_manual_payment(2, 999, 'manual_bkash', 'TXN1')$$, 'amount_mismatch', 'wrong amount rejected');
select test.throws($$select public.record_manual_payment(2, 1000, 'sslcommerz', 'TXN1')$$, 'invalid_input:method', 'gateway method not manual');
select public.record_manual_payment(2, 1000, 'manual_bkash', 'TXN1');
select test.throws($$select public.record_manual_payment(2, 1000, 'manual_bkash', 'TXN1')$$, 'invalid_status', 'cannot pay twice');
reset role;
select test.eq((select status::text from public.cases where id = 2), 'paid', 'case paid');
select test.as_user('anon');
select test.eq((select state from public.get_offer(:'t2')), 'paid', 'offer shows paid');
reset role;

-- Work, delivery, close.
select test.as_user('authenticated', 'aaaaaaaa-0000-0000-0000-000000000001', 'aal2');
select public.change_case_status(2, 'in_progress', null);
select public.change_case_status(2, 'delivered', 'Summary sent on WhatsApp');
select test.throws($$select public.change_case_status(2, 'cancelled', null)$$, 'invalid_transition', 'cannot cancel after delivery');
select public.add_case_note(2, 'Customer happy');
reset role;

-- Refund path on a paid case.
select test.as_user('authenticated', 'aaaaaaaa-0000-0000-0000-000000000002', 'aal2');
select public.record_refund(2, 'Test refund');
reset role;
select test.eq((select status::text from public.cases where id = 2), 'refunded', 'case refunded');
select test.eq((select status::text from public.payments where case_id = 2), 'refunded', 'payment refunded');

-- Withdrawing an offer: offer_sent → triage_done frees the case for a new offer.
select test.as_user('authenticated', 'aaaaaaaa-0000-0000-0000-000000000001', 'aal2');
select public.change_case_status(1, 'triage_done', 'Customer wants a survey instead');
reset role;
select test.eq((select count(*)::int from public.offers where case_id = 1 and withdrawn_at is not null), 1, 'offer withdrawn');

-- Every action left an audit trail.
select test.eq((select count(*)::int from public.case_events where case_id = 2), 8, 'events for case 2');
select test.eq((select count(*)::int from public.case_events where actor is null and kind <> 'created'), 0, 'staff actions have an actor');
