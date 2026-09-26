-- Link audit events to the staff member who made them, so the admin timeline can show names.
alter table public.case_events
  add constraint case_events_actor_fkey foreign key (actor) references public.staff (user_id);
create index case_events_actor_idx on public.case_events (actor);
