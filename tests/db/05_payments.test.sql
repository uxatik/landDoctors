-- Task 11: online payments. Only the server (service_role) can start or confirm them.

insert into auth.users (id, email) values ('aaaaaaaa-0000-0000-0000-000000000001', 'ops@example.com');
insert into public.staff (user_id, name, role) values ('aaaaaaaa-0000-0000-0000-000000000001', 'Ops', 'operations');
insert into public.packages (slug, name_bn, name_en, scope_bn, scope_en, delivery_days, base_price, consultant_share_pct, price_confirmed)
values ('session-30', 'পরামর্শ', 'Session', 'ফোন', 'Phone', 0, 1000, 80, true),
       ('unconfirmed', 'অনিশ্চিত', 'Unconfirmed', 'x', 'x', 0, 5000, 80, false);
insert into public.consultants (name, role, phone, verified, areas) values ('Good', 'surveyor', '+8801700000001', true, '{savar}');
insert into public.cases (category, area, upazila, customer_name, customer_phone, contact_pref)
values ('mutation', 'savar', 'Savar', 'Nasrin', '+8801712345678', 'call'),
       ('mutation', 'savar', 'Savar', 'Karim', '+8801812345678', 'call');

select test.as_user('authenticated', 'aaaaaaaa-0000-0000-0000-000000000001', 'aal2');
select public.assign_consultant(1, 1);
select public.create_offer(1, 1, null, 240, 'Certified copies');   -- total 1240
select public.assign_consultant(2, 1);
select public.create_offer(2, 2, null, 0, '');                     -- price not confirmed
reset role;
select token as t1 from public.offers where case_id = 1 \gset
select token as t2 from public.offers where case_id = 2 \gset

-- Visitors and staff cannot call the payment functions.
select test.as_user('anon');
select test.throws($$select public.begin_online_payment('x')$$, 'permission denied', 'anon cannot begin');
select test.throws($$select public.mark_offer_paid('x', 'v', 1, '{}')$$, 'permission denied', 'anon cannot mark paid');
reset role;
select test.as_user('authenticated', 'aaaaaaaa-0000-0000-0000-000000000001', 'aal2');
select test.throws($$select public.mark_offer_paid('x', 'v', 1, '{}')$$, 'permission denied', 'staff cannot mark paid');
reset role;

-- Server starts a payment: amount comes from the offer, never from the browser.
set role service_role;
select test.eq((select amount from public.begin_online_payment(:'t1')), 1240, 'amount from offer total');
select test.throws(format($$select public.begin_online_payment(%L)$$, :'t2'), 'invalid_status', 'unconfirmed price cannot be paid');
select test.throws($$select public.begin_online_payment('nope-nope-nope-nope-nope-nope-nope')$$, 'not_found', 'unknown token');
reset role;
select tran_id as tr from public.payments where case_id = 1 and status = 'pending' \gset
select test.eq(:'tr' like 'LD-0001-%', true, 'tran_id carries the case ref');

-- A second start (customer pressed back and Pay again) creates a new pending attempt.
set role service_role;
select public.begin_online_payment(:'t1');
reset role;
select test.eq((select count(*)::int from public.payments where case_id = 1 and status = 'pending'), 2, 'two pending attempts');

-- Wrong amount is refused and nothing changes.
set role service_role;
select test.throws(format($$select public.mark_offer_paid(%L, 'val-1', 1000, '{}')$$, :'tr'), 'amount_mismatch', 'wrong amount');
reset role;
select test.eq((select status::text from public.cases where id = 1), 'offer_sent', 'still unpaid after bad amount');

-- Correct confirmation marks paid once; the IPN and the browser return both call it.
set role service_role;
select test.eq(public.mark_offer_paid(:'tr', 'val-1', 1240, '{"status":"VALID"}'), true, 'first confirmation');
select test.eq(public.mark_offer_paid(:'tr', 'val-1', 1240, '{"status":"VALIDATED"}'), false, 'repeat confirmation ignored');
reset role;
select test.eq((select status::text from public.cases where id = 1), 'paid', 'case paid');
select test.eq((select count(*)::int from public.payments where case_id = 1 and status = 'paid'), 1, 'exactly one paid payment');
select test.eq((select count(*)::int from public.payments where case_id = 1 and status = 'pending'), 0, 'other attempts closed');
select test.eq((select count(*)::int from public.case_events where case_id = 1 and kind = 'payment'), 1, 'one payment event');
select test.eq((select paid_at is not null from public.offers where case_id = 1), true, 'offer marked paid');

-- A late confirmation of the other attempt cannot double-charge the case.
select tran_id as tr2 from public.payments where case_id = 1 and status = 'failed' \gset
set role service_role;
select test.eq(public.mark_offer_paid(:'tr2', 'val-2', 1240, '{}'), false, 'second attempt after paid is ignored');
select test.throws(format($$select public.begin_online_payment(%L)$$, :'t1'), 'invalid_status', 'paid offer cannot be paid again');

-- Failure/cancel only touches pending attempts.
select public.mark_payment_failed(:'tr', 'FAILED');
reset role;
select test.eq((select status::text from public.payments where tran_id = :'tr'), 'paid', 'failed callback does not undo a paid payment');
