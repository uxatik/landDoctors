import { z } from "zod";

/**
 * Public values are safe to show in the browser (phone numbers, IDs for analytics).
 * Server values are read only on the server and never prefixed NEXT_PUBLIC_.
 */
const publicSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_HOTLINE: z.string().regex(/^\+8801[3-9]\d{8}$/).default("+8801700000000"),
  NEXT_PUBLIC_WHATSAPP: z.string().regex(/^\+8801[3-9]\d{8}$/).default("+8801700000000"),
  NEXT_PUBLIC_CALLS_ENABLED: z.enum(["true", "false"]).default("false"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20).optional(),
  NEXT_PUBLIC_GA_ID: z.string().optional(),
  NEXT_PUBLIC_CLARITY_ID: z.string().optional(),
});

const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20).optional(),
  IP_HASH_SALT: z.string().min(16).optional(),
  PAYMENTS_ENABLED: z.enum(["true", "false"]).default("false"),
  SSLCOMMERZ_STORE_ID: z.string().optional(),
  SSLCOMMERZ_STORE_PASSWORD: z.string().optional(),
  SSLCOMMERZ_SANDBOX: z.enum(["true", "false"]).default("true"),
});

const emptyToUndefined = (v: string | undefined) => (v === "" ? undefined : v);

export const publicEnv = publicSchema.parse({
  NEXT_PUBLIC_SITE_URL: emptyToUndefined(process.env.NEXT_PUBLIC_SITE_URL),
  NEXT_PUBLIC_HOTLINE: emptyToUndefined(process.env.NEXT_PUBLIC_HOTLINE),
  NEXT_PUBLIC_WHATSAPP: emptyToUndefined(process.env.NEXT_PUBLIC_WHATSAPP),
  NEXT_PUBLIC_CALLS_ENABLED: emptyToUndefined(process.env.NEXT_PUBLIC_CALLS_ENABLED),
  NEXT_PUBLIC_SUPABASE_URL: emptyToUndefined(process.env.NEXT_PUBLIC_SUPABASE_URL),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: emptyToUndefined(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  NEXT_PUBLIC_GA_ID: emptyToUndefined(process.env.NEXT_PUBLIC_GA_ID),
  NEXT_PUBLIC_CLARITY_ID: emptyToUndefined(process.env.NEXT_PUBLIC_CLARITY_ID),
});

/**
 * Whether the site invites people to phone us (call buttons and the hotline number).
 * Off until someone, or something, answers the phone: set CALLS_ENABLED=true to turn it on.
 * We still call customers back either way; this only controls calls coming in.
 */
export const callsEnabled = publicEnv.NEXT_PUBLIC_CALLS_ENABLED === "true";

/** Call only from server code. Throws with the missing variable names if invalid. */
export function serverEnv() {
  if (typeof window !== "undefined") throw new Error("serverEnv() called in the browser");
  const raw = Object.fromEntries(
    Object.keys(serverSchema.shape).map((k) => [k, emptyToUndefined(process.env[k])]),
  );
  return serverSchema.parse(raw);
}
