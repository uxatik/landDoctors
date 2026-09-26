"use server";

import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { parseIntake, type IntakeErrors, type IntakeField, type IntakeValues } from "@/lib/validation/intake";
import { parseDbError, publicClient } from "@/lib/supabase/public";
import { visitorIpHash } from "@/lib/rate-limit";

export type IntakeState = {
  status: "idle" | "error";
  errors: IntakeErrors;
  formError?: "rate_limited" | "unavailable" | "unknown";
  values?: IntakeValues;
};

const FIELDS: IntakeField[] = [
  "category", "area", "upazila", "district", "mouza", "documents", "description", "name", "phone", "contact_pref",
];

export async function submitIntake(_prev: IntakeState, formData: FormData): Promise<IntakeState> {
  const locale = await getLocale();
  const parsed = parseIntake(formData);

  if (!parsed.ok) {
    // Bots that fill the hidden field get a normal-looking thank-you and nothing is stored.
    if (parsed.spam) redirect({ href: { pathname: "/help/thanks", query: { received: "1" } }, locale });
    return { status: "error", errors: parsed.errors, values: parsed.values };
  }

  const values = {
    category: parsed.data.category, area: parsed.data.area, upazila: parsed.data.upazila,
    district: parsed.data.district ?? "", mouza: parsed.data.mouza ?? "", documents: parsed.data.documents,
    description: parsed.data.description, name: parsed.data.name, phone: parsed.data.phone,
    contact_pref: parsed.data.contact_pref,
  };

  const supabase = publicClient();
  if (!supabase) return { status: "error", errors: {}, formError: "unavailable", values };

  const d = parsed.data;
  const { data, error } = await supabase
    .rpc("submit_case", {
      p_category: d.category,
      p_area: d.area,
      p_upazila: d.upazila,
      p_district: d.district,
      p_mouza: d.mouza,
      p_documents: d.documents,
      p_description: d.description,
      p_name: d.name,
      p_phone: d.phone,
      p_contact_pref: d.contact_pref,
      p_idempotency_key: d.idempotency_key,
      p_ip_hash: await visitorIpHash(),
    })
    .single<{ ref: string | null; outcome: "case" | "waitlist" }>();

  if (error || !data) {
    const e = parseDbError(error?.message);
    if (e.kind === "rate_limited") return { status: "error", errors: {}, formError: "rate_limited", values };
    if (e.kind === "invalid_input" && e.field && (FIELDS as string[]).includes(e.field)) {
      return { status: "error", errors: { [e.field]: "invalid" }, values };
    }
    console.error("submit_case failed", error?.code);
    return { status: "error", errors: {}, formError: "unknown", values };
  }

  if (data.outcome === "waitlist") {
    redirect({ href: { pathname: "/help/thanks", query: { waitlist: "1" } }, locale });
  }
  redirect({ href: { pathname: "/help/thanks", query: { ref: data.ref ?? "" } }, locale });
  return { status: "idle", errors: {} };
}
