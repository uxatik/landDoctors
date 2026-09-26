-- Task 2: schema constraints, case reference format, RLS switched on everywhere.

insert into public.consultants (name, role, phone, verified)
values ('Rafiqul Islam', 'surveyor', '+8801712345678', true);

-- Phone must be a normalised Bangladeshi mobile number.
select test.throws($$insert into public.cases (category, area, upazila, customer_name, customer_phone, contact_pref)
  values ('mutation','savar','Savar','Nasrin','017123','call')$$, 'bd_mobile', 'short phone rejected');

select test.throws($$insert into public.cases (category, area, upazila, customer_name, customer_phone, contact_pref)
  values ('mutation','savar','Savar','Nasrin','+880298765432','call')$$, 'bd_mobile', 'landline rejected');

-- Consultant share is a percentage.
select test.throws($$insert into public.consultants (name, role, phone, share_pct)
  values ('Test', 'surveyor', '+8801712345679', 120)$$, 'share_pct', 'share over 100 rejected');

-- Government employees need a sanction reference on file.
select test.throws($$insert into public.consultants (name, role, phone, employment_status)
  values ('Test', 'surveyor', '+8801712345679', 'government_sanctioned')$$, 'government_needs_sanction', 'government without sanction rejected');

-- Field work is only offered in the pilot areas.
select test.throws($$insert into public.cases (category, area, upazila, customer_name, customer_phone, contact_pref)
  values ('survey','other','Cumilla Sadar','Nasrin','+8801712345678','call')$$, 'field_work_in_pilot_area', 'survey outside pilot rejected');

-- Documents must come from the known list.
select test.throws($$insert into public.cases (category, area, upazila, customer_name, customer_phone, contact_pref, documents)
  values ('mutation','savar','Savar','Nasrin','+8801712345678','call', '{passport}')$$, 'documents', 'unknown document rejected');

-- Case references: LD-0001, and no truncation after 9999.
-- (Rejected inserts above used up sequence values; gaps are acceptable, so start fresh.)
select setval('public.case_ref_seq', 1, false);
insert into public.cases (category, area, upazila, customer_name, customer_phone, contact_pref)
values ('mutation','savar','Savar','Nasrin','+8801712345678','call');
select test.eq((select ref from public.cases order by id limit 1), 'LD-0001', 'first ref');

select setval('public.case_ref_seq', 9999);
insert into public.cases (category, area, upazila, customer_name, customer_phone, contact_pref)
values ('mutation','gazipur','Kaliakair','Karim','+8801812345678','whatsapp');
select test.eq((select ref from public.cases order by id desc limit 1), 'LD-10000', 'ref after 9999');

-- Every table in public has row-level security switched on.
select test.eq(
  (select string_agg(relname, ',' order by relname) from pg_class c join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity),
  null, 'tables without RLS');

-- The anonymous role has no table privileges at all.
select test.eq(
  (select string_agg(distinct table_name, ',') from information_schema.role_table_grants
   where table_schema = 'public' and grantee = 'anon'),
  null, 'table grants to anon');

-- Signed-in users never get delete, and never write cases, offers, payments or events directly.
select test.eq(
  (select string_agg(distinct table_name || ':' || privilege_type, ',') from information_schema.role_table_grants
   where table_schema = 'public' and grantee = 'authenticated'
     and (privilege_type in ('DELETE', 'TRUNCATE')
          or (table_name in ('cases', 'offers', 'payments', 'case_events', 'waitlist', 'rate_limits')
              and privilege_type <> 'SELECT'))),
  null, 'dangerous grants to authenticated');

-- Anonymous visitors cannot read or write tables.
select test.as_user('anon');
select test.throws('select * from public.cases', 'permission denied', 'anon select cases');
select test.throws($$insert into public.waitlist (district, upazila, category, phone) values ('Cumilla','Sadar','survey','+8801712345678')$$, 'permission denied', 'anon insert waitlist');
reset role;
