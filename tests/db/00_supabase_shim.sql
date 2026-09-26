-- Minimal stand-in for what a hosted Supabase project provides, so migrations and
-- RLS can be tested on plain Postgres. Mirrors Supabase behaviour that matters for
-- security: the anon/authenticated/service_role roles, auth.uid()/auth.jwt() read
-- from request.jwt.claims, pgcrypto in the extensions schema, and Supabase's
-- default grants (which our migrations must revoke).
create role anon nologin noinherit;
create role authenticated nologin noinherit;
create role service_role nologin noinherit bypassrls;

create schema auth;
create table auth.users (id uuid primary key, email text);

create function auth.jwt() returns jsonb language sql stable as $$
  select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb
$$;
create function auth.uid() returns uuid language sql stable as $$
  select nullif(auth.jwt() ->> 'sub', '')::uuid
$$;
create function auth.role() returns text language sql stable as $$
  select auth.jwt() ->> 'role'
$$;
grant usage on schema auth to anon, authenticated, service_role;
grant execute on all functions in schema auth to anon, authenticated, service_role;

create schema extensions;
create extension pgcrypto schema extensions;
grant usage on schema extensions to anon, authenticated, service_role;

-- Supabase's defaults: everything in public is granted to the API roles.
grant usage on schema public to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
