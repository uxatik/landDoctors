-- LandDoctor Phase 1 — schema.
-- Security rule for every migration: the API roles (anon, authenticated) get NO table
-- privileges. Visitors use narrow security-definer functions; staff use RLS policies.

create schema if not exists private;
revoke all on schema private from public;

-- Supabase grants everything in public to the API roles by default. Undo that for
-- anything this migration owner creates from now on.
alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;
alter default privileges in schema public revoke execute on functions from public, anon, authenticated;

-- Enums ---------------------------------------------------------------------------
create type public.case_status as enum
  ('new', 'triage_done', 'offer_sent', 'paid', 'in_progress', 'delivered', 'closed', 'cancelled', 'refunded');
create type public.area as enum ('savar', 'gazipur', 'other');
create type public.problem_category as enum
  ('pre_purchase_check', 'mutation', 'survey', 'inheritance', 'record_correction', 'dispute');
create type public.contact_pref as enum ('call', 'whatsapp');
create type public.employment_status as enum ('private', 'government_sanctioned');
create type public.consultant_role as enum ('surveyor', 'retired_official', 'advocate', 'deed_writer');
create type public.staff_role as enum ('operations', 'super_admin');
create type public.payment_status as enum ('pending', 'paid', 'failed', 'refunded');
create type public.payment_method as enum
  ('sslcommerz', 'manual_bkash', 'manual_nagad', 'manual_bank', 'manual_cash_office');
create type public.complaint_status as enum ('open', 'resolved');
create type public.event_kind as enum ('created', 'status', 'assign', 'offer', 'payment', 'refund', 'note');

-- Normalised Bangladeshi mobile number, e.g. +8801712345678.
create domain public.bd_mobile as text check (value ~ '^\+8801[3-9][0-9]{8}$');

-- Helpers ------------------------------------------------------------------------
create function private.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end $$;

create sequence public.case_ref_seq;

-- LD-0001 … LD-9999, then LD-10000 (lpad alone would truncate).
create function private.next_case_ref() returns text
language sql volatile set search_path = '' as $$
  select 'LD-' || case when n < 10000 then lpad(n::text, 4, '0') else n::text end
  from (select nextval('public.case_ref_seq') as n) s
$$;

-- Tables -------------------------------------------------------------------------
create table public.staff (
  user_id uuid primary key references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 2 and 80),
  role public.staff_role not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.consultants (
  id bigint generated always as identity primary key,
  name text not null check (char_length(name) between 2 and 80),
  role public.consultant_role not null,
  employment_status public.employment_status not null default 'private',
  sanction_ref text,
  conflict_upazilas text[] not null default '{}',
  areas public.area[] not null default '{}',
  upazilas text[] not null default '{}',
  specialities text[] not null default '{}',
  languages text[] not null default '{bn}',
  phone public.bd_mobile not null,
  payout_account text check (payout_account is null or char_length(payout_account) <= 120),
  share_pct int not null default 80 check (share_pct between 0 and 100),
  verified boolean not null default false,
  active boolean not null default true,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint government_needs_sanction
    check (employment_status = 'private' or char_length(coalesce(sanction_ref, '')) > 0)
);

create table public.packages (
  id bigint generated always as identity primary key,
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name_bn text not null,
  name_en text not null,
  scope_bn text not null,
  scope_en text not null,
  exclusions_bn text not null default '',
  exclusions_en text not null default '',
  delivery_days int not null check (delivery_days between 0 and 60),
  base_price int not null check (base_price >= 0),
  consultant_share_pct int not null check (consultant_share_pct between 0 and 100),
  field_work boolean not null default false,
  price_confirmed boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.cases (
  id bigint generated always as identity primary key,
  ref text not null unique default private.next_case_ref(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  category public.problem_category not null,
  area public.area not null,
  upazila text not null check (char_length(upazila) between 2 and 60),
  mouza text check (mouza is null or char_length(mouza) <= 60),
  documents text[] not null default '{}'
    check (documents <@ array['deed', 'khatian', 'mutation_dcr', 'tax_receipt', 'mouza_map']::text[]),
  description text not null default '' check (char_length(description) <= 1000),
  customer_name text not null check (char_length(customer_name) between 2 and 80),
  customer_phone public.bd_mobile not null,
  contact_pref public.contact_pref not null,
  status public.case_status not null default 'new',
  consultant_id bigint references public.consultants (id),
  source text not null default 'web' check (source in ('web', 'phone', 'whatsapp')),
  idempotency_key uuid unique,
  constraint field_work_in_pilot_area
    check (category not in ('survey', 'pre_purchase_check') or area <> 'other')
);

create table public.offers (
  id bigint generated always as identity primary key,
  case_id bigint not null references public.cases (id),
  package_id bigint not null references public.packages (id),
  consultant_id bigint not null references public.consultants (id),
  token text not null unique check (char_length(token) >= 32),
  service_price int not null check (service_price >= 0),
  govt_fees int not null default 0 check (govt_fees >= 0),
  govt_fees_note text not null default '' check (char_length(govt_fees_note) <= 300),
  price_confirmed boolean not null,
  expires_at timestamptz not null,
  created_by uuid references public.staff (user_id),
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  withdrawn_at timestamptz
);
-- At most one live (unpaid, not withdrawn) offer per case.
create unique index offers_one_open_per_case on public.offers (case_id)
  where paid_at is null and withdrawn_at is null;

create table public.payments (
  id bigint generated always as identity primary key,
  case_id bigint not null references public.cases (id),
  offer_id bigint references public.offers (id),
  amount int not null check (amount > 0),
  method public.payment_method not null,
  tran_id text not null unique,
  gateway_val_id text,
  status public.payment_status not null default 'pending',
  verified_at timestamptz,
  recorded_by uuid references public.staff (user_id),
  reference text check (reference is null or char_length(reference) <= 120),
  raw jsonb,
  created_at timestamptz not null default now()
);

create table public.payouts (
  id bigint generated always as identity primary key,
  consultant_id bigint not null references public.consultants (id),
  period_start date not null,
  period_end date not null check (period_end >= period_start),
  amount int not null check (amount >= 0),
  case_ids bigint[] not null default '{}',
  paid_at timestamptz,
  recorded_by uuid references public.staff (user_id),
  created_at timestamptz not null default now()
);

create table public.waitlist (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  district text not null check (char_length(district) between 2 and 60),
  upazila text not null check (char_length(upazila) between 2 and 60),
  category public.problem_category not null,
  phone public.bd_mobile not null,
  idempotency_key uuid unique
);

create table public.complaints (
  id bigint generated always as identity primary key,
  case_id bigint references public.cases (id),
  phone public.bd_mobile,
  description text not null check (char_length(description) between 1 and 2000),
  status public.complaint_status not null default 'open',
  resolution text check (resolution is null or char_length(resolution) <= 2000),
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid references public.staff (user_id)
);

create table public.case_events (
  id bigint generated always as identity primary key,
  case_id bigint not null references public.cases (id),
  at timestamptz not null default now(),
  actor uuid,
  kind public.event_kind not null,
  from_status public.case_status,
  to_status public.case_status,
  note text check (note is null or char_length(note) <= 2000)
);

create table public.rate_limits (
  ip_hash text not null,
  bucket text not null,
  window_start timestamptz not null,
  count int not null default 0,
  primary key (ip_hash, bucket, window_start)
);

create table public.settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- Indexes ------------------------------------------------------------------------
create index cases_status_created_idx on public.cases (status, created_at desc);
create index cases_area_idx on public.cases (area);
create index cases_consultant_idx on public.cases (consultant_id);
create index offers_case_idx on public.offers (case_id);
create index offers_package_idx on public.offers (package_id);
create index offers_consultant_idx on public.offers (consultant_id);
create index offers_created_by_idx on public.offers (created_by);
create index payments_case_idx on public.payments (case_id);
create index payments_offer_idx on public.payments (offer_id);
create index payments_recorded_by_idx on public.payments (recorded_by);
create index payouts_consultant_idx on public.payouts (consultant_id);
create index payouts_recorded_by_idx on public.payouts (recorded_by);
create index complaints_case_idx on public.complaints (case_id);
create index complaints_resolved_by_idx on public.complaints (resolved_by);
create index case_events_case_at_idx on public.case_events (case_id, at);
create index waitlist_area_idx on public.waitlist (district, upazila);

-- Triggers -----------------------------------------------------------------------
create trigger consultants_touch before update on public.consultants
  for each row execute function private.touch_updated_at();
create trigger packages_touch before update on public.packages
  for each row execute function private.touch_updated_at();
create trigger cases_touch before update on public.cases
  for each row execute function private.touch_updated_at();

-- Lock down ----------------------------------------------------------------------
alter table public.staff enable row level security;
alter table public.consultants enable row level security;
alter table public.packages enable row level security;
alter table public.cases enable row level security;
alter table public.offers enable row level security;
alter table public.payments enable row level security;
alter table public.payouts enable row level security;
alter table public.waitlist enable row level security;
alter table public.complaints enable row level security;
alter table public.case_events enable row level security;
alter table public.rate_limits enable row level security;
alter table public.settings enable row level security;

revoke all on all tables in schema public from public, anon, authenticated;
revoke all on all sequences in schema public from public, anon, authenticated;
revoke execute on all functions in schema public from public, anon, authenticated;
revoke execute on all functions in schema private from public, anon, authenticated;
