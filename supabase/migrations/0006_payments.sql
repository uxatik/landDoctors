-- Online payments through SSLCommerz. These functions are callable ONLY by the server
-- (service_role), after the server has verified the payment with SSLCommerz itself.

-- Starts an online payment for an open offer. The amount always comes from the offer.
create function public.begin_online_payment(p_token text)
returns table (tran_id text, amount int, case_ref text, customer_name text, customer_phone text, product text)
language plpgsql security definer set search_path = '' as $$
declare
  o public.offers;
  c public.cases;
  p public.packages;
  v_tran text;
begin
  select * into o from public.offers where token = p_token for update;
  if not found then raise exception 'not_found:offer'; end if;
  if o.paid_at is not null or o.withdrawn_at is not null or o.expires_at < now() or not o.price_confirmed then
    raise exception 'invalid_status:offer';
  end if;
  select * into c from public.cases where id = o.case_id;
  if c.status <> 'offer_sent' then raise exception 'invalid_status:%', c.status; end if;
  select * into p from public.packages where id = o.package_id;

  v_tran := c.ref || '-' || translate(encode(extensions.gen_random_bytes(6), 'base64'), '+/=', 'xy');
  insert into public.payments (case_id, offer_id, amount, method, tran_id, status)
  values (c.id, o.id, o.service_price + o.govt_fees, 'sslcommerz', v_tran, 'pending');

  return query select v_tran, o.service_price + o.govt_fees, c.ref, c.customer_name, c.customer_phone::text, p.name_en;
end $$;

-- Confirms a payment SSLCommerz has validated. Returns true the first time, false if the
-- case was already paid (repeat IPN, browser return after IPN, or a second attempt).
create function public.mark_offer_paid(p_tran_id text, p_val_id text, p_amount int, p_raw jsonb)
returns boolean language plpgsql security definer set search_path = '' as $$
declare
  pay public.payments;
  o public.offers;
  c public.cases;
begin
  select * into pay from public.payments where tran_id = p_tran_id for update;
  if not found then raise exception 'not_found:payment'; end if;
  if pay.method <> 'sslcommerz' then raise exception 'invalid_input:method'; end if;

  select * into o from public.offers where id = pay.offer_id for update;
  if pay.status = 'paid' or o.paid_at is not null then return false; end if;
  if pay.status not in ('pending', 'failed') then return false; end if;
  if p_amount is distinct from pay.amount then raise exception 'amount_mismatch'; end if;

  select * into c from public.cases where id = pay.case_id for update;

  update public.payments
  set status = 'paid', gateway_val_id = p_val_id, verified_at = now(), raw = p_raw
  where id = pay.id;
  -- Close any other attempts for this offer.
  update public.payments set status = 'failed'
  where offer_id = o.id and id <> pay.id and status = 'pending';
  update public.offers set paid_at = now() where id = o.id;

  if c.status = 'offer_sent' then
    update public.cases set status = 'paid' where id = c.id;
  end if;
  perform private.log_event(c.id, null, 'payment', c.status, 'paid', 'SSLCommerz ' || p_tran_id);
  return true;
end $$;

create function public.mark_payment_failed(p_tran_id text, p_status text)
returns void language sql security definer set search_path = '' as $$
  update public.payments
  set status = 'failed', raw = coalesce(raw, '{}'::jsonb) || jsonb_build_object('gateway_status', left(p_status, 40))
  where tran_id = p_tran_id and status = 'pending';
$$;

revoke execute on function public.begin_online_payment(text) from public, anon, authenticated;
revoke execute on function public.mark_offer_paid(text, text, int, jsonb) from public, anon, authenticated;
revoke execute on function public.mark_payment_failed(text, text) from public, anon, authenticated;
grant execute on function public.begin_online_payment(text) to service_role;
grant execute on function public.mark_offer_paid(text, text, int, jsonb) to service_role;
grant execute on function public.mark_payment_failed(text, text) to service_role;
