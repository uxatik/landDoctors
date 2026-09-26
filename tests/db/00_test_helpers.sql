-- Assertion helpers used by tests/db/*.test.sql (test databases only).
create schema test;
grant usage on schema test to public;

-- Fails unless running p_sql raises an error whose message contains p_expected.
create function test.throws(p_sql text, p_expected text, p_label text default '') returns void
language plpgsql as $$
begin
  begin
    execute p_sql;
  exception when others then
    if position(lower(p_expected) in lower(sqlerrm)) = 0 then
      raise exception 'FAIL %: expected error containing "%", got "%"', p_label, p_expected, sqlerrm;
    end if;
    return;
  end;
  raise exception 'FAIL %: expected an error containing "%", but the statement succeeded', p_label, p_expected;
end $$;

create function test.eq(p_actual anyelement, p_expected anyelement, p_label text) returns void
language plpgsql as $$
begin
  if p_actual is distinct from p_expected then
    raise exception 'FAIL %: expected %, got %', p_label, p_expected, p_actual;
  end if;
end $$;

-- Switch to an API role with JWT claims, the way Supabase does per request.
create function test.as_user(p_role text, p_sub uuid default null, p_aal text default 'aal2') returns void
language plpgsql as $$
begin
  perform set_config('request.jwt.claims',
    json_build_object('sub', p_sub, 'role', p_role, 'aal', p_aal)::text, false);
  execute format('set role %I', p_role);
end $$;

grant execute on all functions in schema test to public;
