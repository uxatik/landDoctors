import { describe, expect, it } from "vitest";
import { assertProductionEnv } from "@/lib/env-check";

const good = {
  VERCEL_ENV: "production", NEXT_PUBLIC_HOTLINE: "+8801711000001", NEXT_PUBLIC_WHATSAPP: "+8801711000002",
  NEXT_PUBLIC_SITE_URL: "https://landdoctor.example", NEXT_PUBLIC_SUPABASE_URL: "https://x.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon", SUPABASE_SERVICE_ROLE_KEY: "service", IP_HASH_SALT: "salt",
} as unknown as NodeJS.ProcessEnv;

describe("assertProductionEnv", () => {
  it("passes with real values", () => expect(() => assertProductionEnv(good)).not.toThrow());
  it("ignores local and preview builds", () => expect(() => assertProductionEnv({} as NodeJS.ProcessEnv)).not.toThrow());
  it("refuses the placeholder hotline", () =>
    expect(() => assertProductionEnv({ ...good, NEXT_PUBLIC_HOTLINE: "+8801700000000" })).toThrow("NEXT_PUBLIC_HOTLINE"));
  it("refuses a missing database key", () =>
    expect(() => assertProductionEnv({ ...good, SUPABASE_SERVICE_ROLE_KEY: "" })).toThrow("SUPABASE_SERVICE_ROLE_KEY"));
});
