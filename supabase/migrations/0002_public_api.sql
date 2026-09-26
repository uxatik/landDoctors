-- Public functions for anonymous visitors. These are the ONLY things the anon role
-- can call. They validate every field, rate-limit by hashed network address, are
-- idempotent on a client-generated key, and never return stored personal data.

-- Converts Bangla digits, strips spaces/dashes/brackets and returns +8801XXXXXXXXX or null.
create function private.normalise_phone(p_input text) returns text
language plpgsql immutable set search_path = '' as $$
declare
  d text;
begin
  if p_input is null then return null; end if;
  d := translate(p_input, '০১২৩৪৫৬৭৮৯', '0123456789');
  d := regexp_replace(d, '[\s\-().]', '', 'g');
  if d ~ '^\+8801[3-9][0-9]{8}$' then return d; end if;
  if d ~ '^8801[3-9][0-9]{8}$' then return '+' || d; end if;
  if d ~ '^01[3-9][0-9]{8}$' then return '+88' || d; end if;
  return null;
end $$;

-- Counts a hit for (ip_hash, bucket) in the current hour; raises rate_limited above p_max.
create function private.hit_rate_limit(p_ip_hash text, p_bucket text, p_max int) returns void
language plpgsql set search_path = '' as $$
declare
  n int;
  w timestamptz := date_trunc('hour', now());
begin
  if p_ip_hash is null or char_length(p_ip_hash) = 0 then
    raise exception 'invalid_input:ip';
  end if;
  insert into public.rate_limits as r (ip_hash, bucket, window_start, count)
  values (p_ip_hash, p_bucket, w, 1)
  on conflict (ip_hash, bucket, window_start) do update set count = r.count + 1
  returning r.count into n;
  if n > p_max then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;
  -- Housekeeping: old windows are not needed.
  delete from public.rate_limits where window_start < now() - interval '2 days';
end $$;

create function private.require_len(p_value text, p_min int, p_max int, p_field text) returns text
language plpgsql immutable set search_path = '' as $$
declare
  v text := btrim(coalesce(p_value, ''));
begin
  if char_length(v) < p_min or char_length(v) > p_max then
    raise exception 'invalid_input:%', p_field;
  end if;
  return v;
end $$;

create function public.submit_case(
  p_category text,
  p_area text,
  p_upazila text,
  p_district text,
  p_mouza text,
  p_documents text[],
  p_description text,
  p_name text,
  p_phone text,
  p_contact_pref text,
  p_idempotency_key uuid,
  p_ip_hash text
) returns table (ref text, outcome text)
language plpgsql security definer set search_path = '' as $$
declare
  v_category public.problem_category;
  v_area public.area;
  v_contact public.contact_pref;
  v_phone text;
  v_upazila text;
  v_district text;
  v_mouza text;
  v_description text;
  v_name text;
  v_docs text[];
  v_case_id bigint;
  v_ref text;
begin
  if p_idempotency_key is null then raise exception 'invalid_input:idempotency_key'; end if;

  -- A repeated key returns what the first request created, without counting a hit.
  select c.ref into v_ref from public.cases c where c.idempotency_key = p_idempotency_key;
  if found then return query select v_ref, 'case'::text; return; end if;
  perform 1 from public.waitlist w where w.idempotency_key = p_idempotency_key;
  if found then return query select null::text, 'waitlist'::text; return; end if;

  perform private.hit_rate_limit(p_ip_hash, 'submit', 5);

  begin v_category := p_category::public.problem_category;
  exception when others then raise exception 'invalid_input:category'; end;
  begin v_area := p_area::public.area;
  exception when others then raise exception 'invalid_input:area'; end;
  begin v_contact := p_contact_pref::public.contact_pref;
  exception when others then raise exception 'invalid_input:contact_pref'; end;

  v_phone := private.normalise_phone(p_phone);
  if v_phone is null then raise exception 'invalid_input:phone'; end if;

  v_upazila := private.require_len(p_upazila, 2, 60, 'upazila');
  v_name := private.require_len(p_name, 2, 80, 'name');
  v_description := private.require_len(p_description, 0, 1000, 'description');
  v_mouza := nullif(private.require_len(p_mouza, 0, 60, 'mouza'), '');

  v_docs := coalesce(p_documents, '{}');
  if not v_docs <@ array['deed', 'khatian', 'mutation_dcr', 'tax_receipt', 'mouza_map']::text[] then
    raise exception 'invalid_input:documents';
  end if;

  if v_area = 'other' then
    v_district := private.require_len(p_district, 2, 60, 'district');
  end if;

  -- Field work outside the pilot areas goes to the waiting list.
  if v_area = 'other' and v_category in ('survey', 'pre_purchase_check') then
    insert into public.waitlist (district, upazila, category, phone, idempotency_key)
    values (v_district, v_upazila, v_category, v_phone, p_idempotency_key)
    on conflict (idempotency_key) do nothing;
    return query select null::text, 'waitlist'::text;
    return;
  end if;

  insert into public.cases (category, area, upazila, mouza, documents, description,
                            customer_name, customer_phone, contact_pref, idempotency_key)
  values (v_category, v_area,
          case when v_area = 'other' then v_upazila || ', ' || v_district else v_upazila end,
          v_mouza, v_docs, v_description, v_name, v_phone, v_contact, p_idempotency_key)
  returning id, cases.ref into v_case_id, v_ref;

  insert into public.case_events (case_id, kind, to_status, note)
  values (v_case_id, 'created', 'new', 'web');

  return query select v_ref, 'case'::text;
end $$;

create function public.join_waitlist(
  p_district text,
  p_upazila text,
  p_category text,
  p_phone text,
  p_idempotency_key uuid,
  p_ip_hash text
) returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_category public.problem_category;
  v_phone text;
begin
  if p_idempotency_key is null then raise exception 'invalid_input:idempotency_key'; end if;
  perform 1 from public.waitlist w where w.idempotency_key = p_idempotency_key;
  if found then return; end if;

  perform private.hit_rate_limit(p_ip_hash, 'waitlist', 5);

  begin v_category := p_category::public.problem_category;
  exception when others then raise exception 'invalid_input:category'; end;
  v_phone := private.normalise_phone(p_phone);
  if v_phone is null then raise exception 'invalid_input:phone'; end if;

  insert into public.waitlist (district, upazila, category, phone, idempotency_key)
  values (private.require_len(p_district, 2, 60, 'district'),
          private.require_len(p_upazila, 2, 60, 'upazila'),
          v_category, v_phone, p_idempotency_key)
  on conflict (idempotency_key) do nothing;
end $$;

revoke execute on function public.submit_case(text, text, text, text, text, text[], text, text, text, text, uuid, text) from public;
revoke execute on function public.join_waitlist(text, text, text, text, uuid, text) from public;
grant execute on function public.submit_case(text, text, text, text, text, text[], text, text, text, text, uuid, text) to anon, authenticated;
grant execute on function public.join_waitlist(text, text, text, text, uuid, text) to anon, authenticated;

revoke execute on all functions in schema private from public, anon, authenticated;
