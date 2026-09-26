-- Task 4: staff access rules. Staff must be active AND two-step verified (aal2).

insert into auth.users (id, email) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'ops@example.com'),
  ('aaaaaaaa-0000-0000-0000-000000000002', 'admin@example.com'),
  ('aaaaaaaa-0000-0000-0000-000000000003', 'former@example.com'),
  ('aaaaaaaa-0000-0000-0000-000000000004', 'stranger@example.com');
insert into public.staff (user_id, name, role, active) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Ops Brother', 'operations', true),
  ('aaaaaaaa-0000-0000-0000-000000000002', 'Founder', 'super_admin', true),
  ('aaaaaaaa-0000-0000-0000-000000000003', 'Former', 'operations', false);
insert into public.packages (slug, name_bn, name_en, scope_bn, scope_en, delivery_days, base_price, consultant_share_pct)
values ('session-30', '৩০ মিনিট পরামর্শ', '30-minute session', 'ফোনে পরামর্শ', 'Phone advice', 0, 1000, 80);
insert into public.cases (category, area, upazila, customer_name, customer_phone, contact_pref)
values ('mutation', 'savar', 'Savar', 'Nasrin', '+8801712345678', 'call');

-- Operations, password only (aal1): sees nothing.
select test.as_user('authenticated', 'aaaaaaaa-0000-0000-0000-000000000001', 'aal1');
select test.eq((select count(*)::int from public.cases), 0, 'aal1 operations sees no cases');
reset role;

-- Operations, two-step verified: reads operational data.
select test.as_user('authenticated', 'aaaaaaaa-0000-0000-0000-000000000001', 'aal2');
select test.eq((select count(*)::int from public.cases), 1, 'operations sees cases');
select test.eq((select count(*)::int from public.packages), 1, 'operations sees packages');
-- …but cannot change prices, consultants, payouts, settings or staff.
update public.packages set base_price = 1 where slug = 'session-30';  -- silently matches no rows under RLS
select test.throws($$insert into public.consultants (name, role, phone) values ('X Y', 'surveyor', '+8801712345670')$$, 'row-level security', 'ops cannot add consultant');
select test.throws($$insert into public.settings (key, value) values ('hotline', '"x"')$$, 'row-level security', 'ops cannot change settings');
select test.throws($$insert into public.staff (user_id, name, role) values ('aaaaaaaa-0000-0000-0000-000000000004', 'New', 'super_admin')$$, 'row-level security', 'ops cannot add staff');
select test.throws($$insert into public.payouts (consultant_id, period_start, period_end, amount) values (1, current_date, current_date, 1)$$, 'row-level security', 'ops cannot add payouts');
-- …and cannot change cases directly (only through workflow functions).
select test.throws($$update public.cases set status = 'paid'$$, 'permission denied', 'ops cannot update cases directly');
select test.throws($$insert into public.payments (case_id, amount, method, tran_id, status) values (1, 1000, 'manual_bkash', 'x', 'paid')$$, 'permission denied', 'ops cannot insert payments directly');
reset role;

select test.eq((select base_price from public.packages where slug = 'session-30'), 1000, 'ops price change had no effect');

-- Super admin, two-step verified: manages prices and consultants.
select test.as_user('authenticated', 'aaaaaaaa-0000-0000-0000-000000000002', 'aal2');
update public.packages set base_price = 1200 where slug = 'session-30';
insert into public.consultants (name, role, phone, verified) values ('Rafiqul Islam', 'surveyor', '+8801712345671', true);
insert into public.settings (key, value) values ('hotline', '"+8801711000001"');
reset role;
select test.eq((select base_price from public.packages where slug = 'session-30'), 1200, 'super admin changed price');
select test.eq((select count(*)::int from public.consultants), 1, 'super admin added consultant');

-- Super admin without two-step verification: blocked.
select test.as_user('authenticated', 'aaaaaaaa-0000-0000-0000-000000000002', 'aal1');
select test.eq((select count(*)::int from public.cases), 0, 'aal1 super admin sees nothing');
reset role;

-- Inactive staff and signed-in strangers: nothing.
select test.as_user('authenticated', 'aaaaaaaa-0000-0000-0000-000000000003', 'aal2');
select test.eq((select count(*)::int from public.cases), 0, 'inactive staff sees nothing');
reset role;
select test.as_user('authenticated', 'aaaaaaaa-0000-0000-0000-000000000004', 'aal2');
select test.eq((select count(*)::int from public.cases), 0, 'non-staff sees nothing');
select test.eq((select count(*)::int from public.staff), 0, 'non-staff cannot list staff');
reset role;

-- Anonymous: still nothing.
select test.as_user('anon');
select test.throws('select * from public.packages', 'permission denied', 'anon cannot read packages');
reset role;
