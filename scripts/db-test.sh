#!/usr/bin/env bash
# Runs database tests on a throwaway local Postgres cluster.
# 1. Creates a temp cluster  2. Loads the Supabase shim  3. Applies migrations into a template DB
# 4. Runs each tests/db/NN_*.test.sql in its own fresh copy of the template.
# Needs Postgres 15+ binaries (set PG_BIN if they are not on PATH).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# initdb refuses to run as root; re-run as the owner of the project folder.
if [ "$(id -u)" = "0" ]; then
  OWNER="$(stat -c %U "$ROOT" 2>/dev/null || stat -f %Su "$ROOT")"
  [ "$OWNER" = "root" ] && OWNER=claude
  exec runuser -u "$OWNER" -- bash "$0" "$@"
fi

PG_BIN="${PG_BIN:-$(pg_config --bindir 2>/dev/null || true)}"
[ -x "$PG_BIN/initdb" ] || PG_BIN=/usr/lib/postgresql/16/bin
[ -x "$PG_BIN/initdb" ] || { echo "Postgres binaries not found. Set PG_BIN." >&2; exit 1; }

TMP="$(mktemp -d)"
PORT="${PGTEST_PORT:-54329}"
cleanup() { "$PG_BIN/pg_ctl" -D "$TMP/data" -m immediate stop >/dev/null 2>&1 || true; rm -rf "$TMP"; }
trap cleanup EXIT

"$PG_BIN/initdb" -D "$TMP/data" -U postgres --auth=trust -E UTF8 --locale=C.UTF-8 >/dev/null
"$PG_BIN/pg_ctl" -D "$TMP/data" -o "-p $PORT -k $TMP -c listen_addresses=''" -l "$TMP/log" -w start >/dev/null

PSQL=("$PG_BIN/psql" -h "$TMP" -p "$PORT" -U postgres -v ON_ERROR_STOP=1 -q -X -t)

"${PSQL[@]}" -d postgres -c "create database ld_template"
"${PSQL[@]}" -d ld_template -f "$ROOT/tests/db/00_supabase_shim.sql"
for f in "$ROOT"/supabase/migrations/*.sql; do
  "${PSQL[@]}" -d ld_template -f "$f"
done
"${PSQL[@]}" -d ld_template -f "$ROOT/tests/db/00_test_helpers.sql"

pass=0; fail=0

# A project set up from the first setup.sql (migrations 0001–0004 + seed) must accept the update file.
"${PSQL[@]}" -d postgres -c "create database t_update"
"${PSQL[@]}" -d t_update -f "$ROOT/tests/db/00_supabase_shim.sql"
for f in "$ROOT"/supabase/migrations/000[1-4]_*.sql "$ROOT/supabase/seed.sql"; do "${PSQL[@]}" -d t_update -f "$f"; done
if out="$("${PSQL[@]}" -d t_update -f "$ROOT/supabase/updates/001_after_first_setup.sql" 2>&1)"; then
  echo "  ✓ supabase/updates/001 applies on top of the first setup"; pass=$((pass+1))
else
  echo "  ✗ supabase/updates/001"; echo "$out" | sed 's/^/      /'; fail=$((fail+1))
fi

# The one-file setup for the Supabase SQL editor must apply cleanly to a fresh project.
"${PSQL[@]}" -d postgres -c "create database t_setup"
"${PSQL[@]}" -d t_setup -f "$ROOT/tests/db/00_supabase_shim.sql"
if out="$("${PSQL[@]}" -d t_setup -f "$ROOT/supabase/setup.sql" 2>&1)" && \
   [ "$("${PSQL[@]}" -d t_setup -c "select count(*) from public.packages")" -eq 3 ]; then
  echo "  ✓ supabase/setup.sql applies cleanly and seeds 3 packages"; pass=$((pass+1))
else
  echo "  ✗ supabase/setup.sql"; echo "$out" | sed 's/^/      /'; fail=$((fail+1))
fi
for t in "$ROOT"/tests/db/[0-9][0-9]_*.test.sql; do
  name="$(basename "$t")"
  db="t_$(echo "$name" | tr -c 'a-z0-9' '_' | cut -c1-40)"
  "${PSQL[@]}" -d postgres -c "create database $db template ld_template"
  if out="$("${PSQL[@]}" -d "$db" -f "$t" 2>&1)"; then
    echo "  ✓ $name"; pass=$((pass+1))
  else
    echo "  ✗ $name"; echo "$out" | sed 's/^/      /'; fail=$((fail+1))
  fi
done
echo "db tests: $pass passed, $fail failed"
[ "$fail" -eq 0 ]
