-- Task 3: public functions for visitors (submit a case, join the waiting list).

select test.as_user('anon');

-- Normal case in a pilot area.
select test.eq(
  (select row(ref, outcome)::text from public.submit_case(
     'mutation', 'savar', 'Savar', null, null, '{deed,khatian}', 'নামজারি আবেদন বাতিল হয়েছে',
     'Nasrin Akter', '01712345678', 'call', '11111111-1111-1111-1111-111111111111', 'ip-a')),
  '(LD-0001,case)', 'savar case created');

-- Same idempotency key (double tap on a slow connection) returns the same case.
select test.eq(
  (select ref from public.submit_case(
     'mutation', 'savar', 'Savar', null, null, '{deed,khatian}', 'নামজারি আবেদন বাতিল হয়েছে',
     'Nasrin Akter', '01712345678', 'call', '11111111-1111-1111-1111-111111111111', 'ip-a')),
  'LD-0001', 'idempotent resubmit');

-- Field work outside the pilot goes to the waiting list, not a case.
select test.eq(
  (select row(ref, outcome)::text from public.submit_case(
     'survey', 'other', 'Sadar', 'Cumilla', null, '{}', '', 'Karim', '+8801812345678', 'whatsapp',
     '22222222-2222-2222-2222-222222222222', 'ip-b')),
  '(,waitlist)', 'survey outside pilot → waitlist');

-- A phone session from anywhere becomes a case.
select test.eq(
  (select outcome from public.submit_case(
     'inheritance', 'other', 'Sadar', 'Sylhet', null, '{}', '', 'Rina', '8801912345678', 'call',
     '33333333-3333-3333-3333-333333333333', 'ip-b')),
  'case', 'session from anywhere → case');

-- Phone formats all normalise, including Bangla digits and separators.
select public.submit_case('dispute', 'gazipur', 'Kaliakair', null, null, '{}', '', 'Test One',
  '০১৭১২-৩৪৫৬৭৮', 'call', '44444444-4444-4444-4444-444444444444', 'ip-c');
select public.submit_case('dispute', 'gazipur', 'Kaliakair', null, null, '{}', '', 'Test Two',
  '+880 1712 345678', 'call', '55555555-5555-5555-5555-555555555555', 'ip-c');

-- Bad input is rejected with a field name the app can show.
select test.throws($$select public.submit_case('dispute','gazipur','Kaliakair',null,null,'{}','','Test','029876543','call',gen_random_uuid(),'ip-d')$$,
  'invalid_input:phone', 'landline rejected');
select test.throws($$select public.submit_case('dispute','gazipur','Kaliakair',null,null,'{}',repeat('x',1001),'Test','01712345678','call',gen_random_uuid(),'ip-d')$$,
  'invalid_input:description', 'long description rejected');
select test.throws($$select public.submit_case('dispute','gazipur','K',null,null,'{}','','Test','01712345678','call',gen_random_uuid(),'ip-d')$$,
  'invalid_input:upazila', 'short upazila rejected');
select test.throws($$select public.submit_case('dispute','gazipur','Kaliakair',null,null,'{}','','T','01712345678','call',gen_random_uuid(),'ip-d')$$,
  'invalid_input:name', 'short name rejected');
select test.throws($$select public.submit_case('dispute','other','Sadar',null,null,'{}','','Test','01712345678','call',gen_random_uuid(),'ip-d')$$,
  'invalid_input:district', 'district needed outside pilot');
select test.throws($$select public.submit_case('dispute','gazipur','Kaliakair',null,null,'{passport}','','Test','01712345678','call',gen_random_uuid(),'ip-d')$$,
  'invalid_input:documents', 'unknown document rejected');

-- Rate limit: 5 submissions per hour per network address.
select public.submit_case('dispute','savar','Savar',null,null,'{}','','Rate Test','01712345678','call',gen_random_uuid(),'ip-rate') from generate_series(1,5);
select test.throws($$select public.submit_case('dispute','savar','Savar',null,null,'{}','','Rate Test','01712345678','call',gen_random_uuid(),'ip-rate')$$,
  'rate_limited', '6th submission in an hour');

-- Joining the waiting list directly.
select public.join_waitlist('Narayanganj', 'Rupganj', 'pre_purchase_check', '01612345678',
  '66666666-6666-6666-6666-666666666666', 'ip-e');
select public.join_waitlist('Narayanganj', 'Rupganj', 'pre_purchase_check', '01612345678',
  '66666666-6666-6666-6666-666666666666', 'ip-e');

-- Visitors still cannot read anything back.
select test.throws('select * from public.cases', 'permission denied', 'anon cannot read cases');
select test.throws('select * from public.waitlist', 'permission denied', 'anon cannot read waitlist');
select test.throws($$select private.normalise_phone('01712345678')$$, 'permission denied', 'anon cannot call private functions');
select test.throws($$insert into public.rate_limits values ('x','submit',now(),0)$$, 'permission denied', 'anon cannot reset rate limits');
reset role;

-- Check what was stored (as the owner).
select test.eq((select count(*)::int from public.cases where customer_phone = '+8801712345678' and customer_name like 'Test%'), 2, 'normalised phones stored');
select test.eq((select count(*)::int from public.cases where idempotency_key = '11111111-1111-1111-1111-111111111111'), 1, 'one row for double tap');
select test.eq((select count(*)::int from public.waitlist), 2, 'two waitlist rows (survey + direct, idempotent)');
select test.eq((select count(*)::int from public.case_events where kind = 'created'), (select count(*)::int from public.cases), 'created event per case');
select test.eq((select district from public.waitlist where category = 'survey'), 'Cumilla', 'waitlist keeps district');
