-- Staff access. A staff member counts only when their row is active AND their session
-- is two-step verified (JWT aal = 'aal2'). Everything else sees nothing.

create function private.staff_role() returns public.staff_role
language sql stable security definer set search_path = '' as $$
  select s.role
  from public.staff s
  where s.user_id = (select auth.uid())
    and s.active
    and coalesce((select auth.jwt()) ->> 'aal', '') = 'aal2'
$$;

grant usage on schema private to authenticated;
revoke execute on function private.staff_role() from public, anon;
grant execute on function private.staff_role() to authenticated;

-- Read access for staff --------------------------------------------------------------
grant select on public.cases, public.offers, public.payments, public.payouts, public.waitlist,
  public.complaints, public.case_events, public.consultants, public.packages, public.staff,
  public.settings to authenticated;

create policy staff_read on public.cases for select to authenticated
  using ((select private.staff_role()) is not null);
create policy staff_read on public.offers for select to authenticated
  using ((select private.staff_role()) is not null);
create policy staff_read on public.payments for select to authenticated
  using ((select private.staff_role()) is not null);
create policy staff_read on public.payouts for select to authenticated
  using ((select private.staff_role()) is not null);
create policy staff_read on public.waitlist for select to authenticated
  using ((select private.staff_role()) is not null);
create policy staff_read on public.complaints for select to authenticated
  using ((select private.staff_role()) is not null);
create policy staff_read on public.case_events for select to authenticated
  using ((select private.staff_role()) is not null);
create policy staff_read on public.consultants for select to authenticated
  using ((select private.staff_role()) is not null);
create policy staff_read on public.packages for select to authenticated
  using ((select private.staff_role()) is not null);
create policy staff_read on public.staff for select to authenticated
  using ((select private.staff_role()) is not null);
create policy staff_read on public.settings for select to authenticated
  using ((select private.staff_role()) is not null);

-- Complaints: any verified staff member can log and resolve them ------------------------
grant insert (case_id, phone, description), update (status, resolution, resolved_at, resolved_by)
  on public.complaints to authenticated;
create policy staff_insert on public.complaints for insert to authenticated
  with check ((select private.staff_role()) is not null);
create policy staff_update on public.complaints for update to authenticated
  using ((select private.staff_role()) is not null)
  with check ((select private.staff_role()) is not null);

-- Super admin only: consultants, packages, payouts, settings, staff ---------------------
grant insert, update on public.consultants, public.packages, public.payouts, public.settings,
  public.staff to authenticated;

create policy admin_insert on public.consultants for insert to authenticated
  with check ((select private.staff_role()) = 'super_admin');
create policy admin_update on public.consultants for update to authenticated
  using ((select private.staff_role()) = 'super_admin')
  with check ((select private.staff_role()) = 'super_admin');

create policy admin_insert on public.packages for insert to authenticated
  with check ((select private.staff_role()) = 'super_admin');
create policy admin_update on public.packages for update to authenticated
  using ((select private.staff_role()) = 'super_admin')
  with check ((select private.staff_role()) = 'super_admin');

create policy admin_insert on public.payouts for insert to authenticated
  with check ((select private.staff_role()) = 'super_admin');
create policy admin_update on public.payouts for update to authenticated
  using ((select private.staff_role()) = 'super_admin')
  with check ((select private.staff_role()) = 'super_admin');

create policy admin_insert on public.settings for insert to authenticated
  with check ((select private.staff_role()) = 'super_admin');
create policy admin_update on public.settings for update to authenticated
  using ((select private.staff_role()) = 'super_admin')
  with check ((select private.staff_role()) = 'super_admin');

create policy admin_insert on public.staff for insert to authenticated
  with check ((select private.staff_role()) = 'super_admin');
create policy admin_update on public.staff for update to authenticated
  using ((select private.staff_role()) = 'super_admin')
  with check ((select private.staff_role()) = 'super_admin');

-- Identity columns need sequence usage for inserts.
grant usage on all sequences in schema public to authenticated;
revoke usage on sequence public.case_ref_seq from authenticated;
