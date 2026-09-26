import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { publicEnv } from "@/lib/env";

/** Anonymous Supabase client for the public functions. Null when not configured. */
export function publicClient(): SupabaseClient | null {
  const url = publicEnv.NEXT_PUBLIC_SUPABASE_URL;
  const key = publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

/** Turns a database error like "invalid_input:phone" into { kind, field }. */
export function parseDbError(message: string | undefined): { kind: string; field?: string } {
  const m = (message ?? "").trim();
  const [kind, field] = m.split(":");
  return { kind: kind || "unknown", field: field || undefined };
}
