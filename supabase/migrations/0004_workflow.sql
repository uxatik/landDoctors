-- Case workflow. Staff change cases ONLY through these functions, which enforce the
-- allowed transitions, consultant eligibility, the conflict-of-interest rule and pricing
-- rights, and write an audit event for every action.

-- Allowed status moves made by hand. offer_sent, paid and refunded are reached only
-- through create_offer, the payment functions and record_refund.
create table private.case_transitions (
  from_status public.case_status not null,
  to_status public.case_status not null,
  primary key (from_status, to_status)
);
-- transitions:begin (kept in sync with lib/cases/workflow.ts by tests/unit/workflow.test.ts)
insert into private.case_transitions (from_status, to_status) values
  ('new', 'triage_done'),
  ('new', 'cancelled'),
  ('triage_done', 'cancelled'),
  ('offer_sent', 'triage_done'),
  ('offer_sent', 'cancelled'),
  ('paid', 'in_progress'),
  ('in_progress', 'delivered'),
  ('delivered', 'closed');
-- transitions:end

insert into public.settings (key, value) values
  ('allow_government_consultants', 'false'),
  ('offer_valid_days', '7')
on conflict (key) do nothing;

-- Returns the caller's user id if they are verified staff (optionally super admin).
create function private.require_staff(p_super_admin boolean default false) returns uuid
language plpgsql stable set search_path = '' as $$
declare
  r public.staff_role := private.staff_role();
begin
  if r is null or (p_super_admin and r <> 'super_admin') then
    raise exception 'not_authorised' using errcode = '42501';
  end if;
  return (select auth.uid());
end $$;

create function private.log_event(p_case_id bigint, p_actor uuid, p_kind public.event_kind,
  p_from public.case_status, p_to public.case_status, p_note text) returns void
language sql set search_path = '' as $$
  insert into public.case_events (case_id, actor, kind, from_status, to_status, note)
  values (p_case_id, p_actor, p_kind, p_from, p_to, nullif(btrim(coalesce(p_note, '')), ''));
$$;

create function private.lock_case(p_case_id bigint) returns public.cases
language plpgsql set search_path = '' as $$
declare
  c public.cases;
begin
  select * into c from public.cases where id = p_case_id for update;
  if not found then raise exception 'not_found:case'; end if;
  return c;
end $$;

-- 32-character URL-safe random token.
create function private.new_token() returns text
language sql volatile set search_path = '' as $$
  select translate(encode(extensions.gen_random_bytes(24), 'base64'), '+/', '-_')
$$;

-- change_case_status ---------------------------------------------------------------
create function public.change_case_status(p_case_id bigint, p_to text, p_note text)
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_actor uuid := private.require_staff();
  c public.cases := private.lock_case(p_case_id);
  v_to public.case_status;
begin
  begin v_to := p_to::public.case_status;
  exception when others then raise exception 'invalid_input:status'; end;

  if not exists (select 1 from private.case_transitions t
                 where t.from_status = c.status and t.to_status = v_to) then
    raise exception 'invalid_transition:% → %', c.status, v_to;
  end if;
  if v_to = 'in_progress' and c.consultant_id is null then
    raise exception 'consultant_required';
  end if;

  -- Leaving offer_sent withdraws the open offer.
  if c.status = 'offer_sent' then
    update public.offers set withdrawn_at = now()
    where case_id = c.id and paid_at is null and withdrawn_at is null;
  end if;

  update public.cases set status = v_to where id = c.id;
  perform private.log_event(c.id, v_actor, 'status', c.status, v_to, p_note);
end $$;

-- assign_consultant ----------------------------------------------------------------
create function public.assign_consultant(p_case_id bigint, p_consultant_id bigint)
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_actor uuid := private.require_staff();
  c public.cases := private.lock_case(p_case_id);
  k public.consultants;
  v_allow_gov boolean;
  v_case_upazila text;
begin
  if c.status in ('closed', 'cancelled', 'refunded', 'delivered') then
    raise exception 'invalid_status:%', c.status;
  end if;

  select * into k from public.consultants where id = p_consultant_id;
  if not found then raise exception 'not_found:consultant'; end if;

  select coalesce((value)::boolean, false) into v_allow_gov
  from public.settings where key = 'allow_government_consultants';

  if not k.verified or not k.active or k.is_demo
     or (k.employment_status = 'government_sanctioned' and not coalesce(v_allow_gov, false)) then
    raise exception 'consultant_not_eligible';
  end if;

  -- Conflict of interest: no cases from an upazila where they work or have worked.
  v_case_upazila := lower(btrim(split_part(c.upazila, ',', 1)));
  if exists (select 1 from unnest(k.conflict_upazilas) u where lower(btrim(u)) = v_case_upazila) then
    raise exception 'conflict_of_interest';
  end if;

  -- Field work needs a consultant who covers the area.
  if c.category in ('survey', 'pre_purchase_check') and not (c.area = any (k.areas)) then
    raise exception 'outside_consultant_area';
  end if;

  update public.cases set consultant_id = k.id where id = c.id;
  perform private.log_event(c.id, v_actor, 'assign', null, null, k.name);
end $$;

-- create_offer ---------------------------------------------------------------------
-- p_service_price null = package price. Only a super admin may set a different price.
create function public.create_offer(p_case_id bigint, p_package_id bigint, p_service_price int,
  p_govt_fees int, p_govt_fees_note text)
returns text language plpgsql security definer set search_path = '' as $$
declare
  v_actor uuid := private.require_staff();
  v_role public.staff_role := private.staff_role();
  c public.cases := private.lock_case(p_case_id);
  p public.packages;
  v_price int;
  v_token text;
  v_days int;
begin
  -- Expired offers no longer block a new one.
  update public.offers set withdrawn_at = now()
  where case_id = c.id and paid_at is null and withdrawn_at is null and expires_at < now();

  if c.status not in ('new', 'triage_done') then
    raise exception 'invalid_status:%', c.status;
  end if;
  if c.consultant_id is null then raise exception 'consultant_required'; end if;

  select * into p from public.packages where id = p_package_id and active;
  if not found then raise exception 'not_found:package'; end if;

  v_price := coalesce(p_service_price, p.base_price);
  if v_price <> p.base_price and v_role <> 'super_admin' then
    raise exception 'not_authorised:price' using errcode = '42501';
  end if;
  if v_price < 0 or coalesce(p_govt_fees, 0) < 0 then raise exception 'invalid_input:price'; end if;

  select coalesce((value)::int, 7) into v_days from public.settings where key = 'offer_valid_days';
  v_token := private.new_token();

  insert into public.offers (case_id, package_id, consultant_id, token, service_price, govt_fees,
                             govt_fees_note, price_confirmed, expires_at, created_by)
  values (c.id, p.id, c.consultant_id, v_token, v_price, coalesce(p_govt_fees, 0),
          btrim(coalesce(p_govt_fees_note, '')), p.price_confirmed,
          now() + make_interval(days => coalesce(v_days, 7)), v_actor);

  update public.cases set status = 'offer_sent' where id = c.id;
  perform private.log_event(c.id, v_actor, 'offer', c.status, 'offer_sent', p.name_en);
  return v_token;
end $$;

-- get_offer (public) -----------------------------------------------------------------
create function public.get_offer(p_token text)
returns table (
  ref text, category text, status text,
  package_name_bn text, package_name_en text, scope_bn text, scope_en text,
  exclusions_bn text, exclusions_en text, delivery_days int,
  service_price int, govt_fees int, govt_fees_note text, total int,
  consultant_name text, consultant_role text, consultant_areas text[], consultant_verified boolean,
  expires_at timestamptz, state text)
language sql stable security definer set search_path = '' as $$
  select c.ref, c.category::text, c.status::text,
         p.name_bn, p.name_en, p.scope_bn, p.scope_en, p.exclusions_bn, p.exclusions_en, p.delivery_days,
         o.service_price, o.govt_fees, o.govt_fees_note, o.service_price + o.govt_fees,
         k.name, k.role::text, k.areas::text[], k.verified,
         o.expires_at,
         case
           when o.paid_at is not null then 'paid'
           when o.withdrawn_at is not null or o.expires_at < now() then 'expired'
           when not o.price_confirmed then 'price_unconfirmed'
           else 'open'
         end
  from public.offers o
  join public.cases c on c.id = o.case_id
  join public.packages p on p.id = o.package_id
  join public.consultants k on k.id = o.consultant_id
  where o.token = p_token and char_length(p_token) >= 32
$$;

-- Payments recorded by staff -----------------------------------------------------------
create function private.open_offer(p_case_id bigint) returns public.offers
language plpgsql set search_path = '' as $$
declare
  o public.offers;
begin
  select * into o from public.offers
  where case_id = p_case_id and paid_at is null and withdrawn_at is null
  for update;
  if not found then raise exception 'invalid_status:no_open_offer'; end if;
  return o;
end $$;

create function public.record_manual_payment(p_case_id bigint, p_amount int, p_method text, p_reference text)
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_actor uuid := private.require_staff();
  c public.cases := private.lock_case(p_case_id);
  o public.offers;
  v_method public.payment_method;
begin
  begin v_method := p_method::public.payment_method;
  exception when others then raise exception 'invalid_input:method'; end;
  if v_method = 'sslcommerz' then raise exception 'invalid_input:method'; end if;
  if c.status <> 'offer_sent' then raise exception 'invalid_status:%', c.status; end if;

  o := private.open_offer(c.id);
  if p_amount is distinct from (o.service_price + o.govt_fees) then
    raise exception 'amount_mismatch';
  end if;

  insert into public.payments (case_id, offer_id, amount, method, tran_id, status, verified_at, recorded_by, reference)
  values (c.id, o.id, p_amount, v_method, 'manual-' || o.id, 'paid', now(), v_actor,
          nullif(btrim(coalesce(p_reference, '')), ''));
  update public.offers set paid_at = now() where id = o.id;
  update public.cases set status = 'paid' where id = c.id;
  perform private.log_event(c.id, v_actor, 'payment', c.status, 'paid',
    v_method::text || coalesce(' ' || p_reference, ''));
end $$;

create function public.record_refund(p_case_id bigint, p_note text)
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_actor uuid := private.require_staff();
  c public.cases := private.lock_case(p_case_id);
begin
  if c.status not in ('paid', 'in_progress', 'delivered') then
    raise exception 'invalid_status:%', c.status;
  end if;
  update public.payments set status = 'refunded' where case_id = c.id and status = 'paid';
  update public.cases set status = 'refunded' where id = c.id;
  perform private.log_event(c.id, v_actor, 'refund', c.status, 'refunded', p_note);
end $$;

create function public.add_case_note(p_case_id bigint, p_note text)
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_actor uuid := private.require_staff();
  c public.cases := private.lock_case(p_case_id);
begin
  if char_length(btrim(coalesce(p_note, ''))) = 0 then raise exception 'invalid_input:note'; end if;
  perform private.log_event(c.id, v_actor, 'note', null, null, p_note);
end $$;

-- Grants ------------------------------------------------------------------------------
revoke execute on all functions in schema private from public, anon, authenticated;
grant execute on function private.staff_role() to authenticated;

revoke execute on function public.change_case_status(bigint, text, text) from public;
revoke execute on function public.assign_consultant(bigint, bigint) from public;
revoke execute on function public.create_offer(bigint, bigint, int, int, text) from public;
revoke execute on function public.get_offer(text) from public;
revoke execute on function public.record_manual_payment(bigint, int, text, text) from public;
revoke execute on function public.record_refund(bigint, text) from public;
revoke execute on function public.add_case_note(bigint, text) from public;

grant execute on function public.change_case_status(bigint, text, text) to authenticated;
grant execute on function public.assign_consultant(bigint, bigint) to authenticated;
grant execute on function public.create_offer(bigint, bigint, int, int, text) to authenticated;
grant execute on function public.record_manual_payment(bigint, int, text, text) to authenticated;
grant execute on function public.record_refund(bigint, text) to authenticated;
grant execute on function public.add_case_note(bigint, text) to authenticated;
grant execute on function public.get_offer(text) to anon, authenticated;
