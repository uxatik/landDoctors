import { z } from "zod";
import { CATEGORY_SLUGS } from "@/lib/content/categories";
import { normalisePhone } from "@/lib/phone";

export const AREAS = ["savar", "gazipur", "other"] as const;
export const DOCUMENTS = ["deed", "khatian", "mutation_dcr", "tax_receipt", "mouza_map"] as const;
export const CONTACT_PREFS = ["call", "whatsapp"] as const;

export type IntakeField =
  | "category" | "area" | "upazila" | "district" | "mouza" | "documents"
  | "description" | "name" | "phone" | "contact_pref";
export type ErrorCode = "required" | "invalid" | "too_long";
export type IntakeErrors = Partial<Record<IntakeField, ErrorCode>>;

/** What the user typed, echoed back so a failed submit keeps their input. */
export type IntakeValues = {
  category: string; area: string; upazila: string; district: string; mouza: string;
  documents: string[]; description: string; name: string; phone: string; contact_pref: string;
};

export type IntakeData = {
  category: (typeof CATEGORY_SLUGS)[number];
  area: (typeof AREAS)[number];
  upazila: string;
  district: string | null;
  mouza: string | null;
  documents: (typeof DOCUMENTS)[number][];
  description: string;
  name: string;
  phone: string;
  contact_pref: (typeof CONTACT_PREFS)[number];
  idempotency_key: string;
};

export type IntakeResult =
  | { ok: true; data: IntakeData }
  | { ok: false; errors: IntakeErrors; values: IntakeValues; spam: boolean };

const text = (min: number, max: number) =>
  z.string().trim().superRefine((v, ctx) => {
    if (v.length < min) ctx.addIssue({ code: "custom", message: min > 0 && v.length === 0 ? "required" : "invalid" });
    else if (v.length > max) ctx.addIssue({ code: "custom", message: "too_long" });
  });

const schema = z.object({
  category: z.enum(CATEGORY_SLUGS, { error: "required" }),
  area: z.enum(AREAS, { error: "required" }),
  upazila: text(2, 60),
  district: z.string().trim(),
  mouza: text(0, 60),
  documents: z.array(z.enum(DOCUMENTS, { error: "invalid" }), { error: "invalid" }),
  description: text(0, 1000),
  name: text(2, 80),
  phone: z.string().trim().superRefine((v, ctx) => {
    if (v.length === 0) ctx.addIssue({ code: "custom", message: "required" });
    else if (normalisePhone(v) === null) ctx.addIssue({ code: "custom", message: "invalid" });
  }),
  contact_pref: z.enum(CONTACT_PREFS, { error: "required" }),
  idempotency_key: z.uuid({ error: "invalid" }),
});

function str(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v : "";
}

export function readIntakeValues(fd: FormData): IntakeValues {
  return {
    category: str(fd, "category"),
    area: str(fd, "area"),
    upazila: str(fd, "upazila"),
    district: str(fd, "district"),
    mouza: str(fd, "mouza"),
    documents: fd.getAll("documents").filter((d): d is string => typeof d === "string"),
    description: str(fd, "description"),
    name: str(fd, "name"),
    phone: str(fd, "phone"),
    contact_pref: str(fd, "contact_pref"),
  };
}

/** Validates the intake form. Shared by the server action and the unit tests. */
export function parseIntake(fd: FormData): IntakeResult {
  const values = readIntakeValues(fd);
  if (str(fd, "website").trim() !== "") return { ok: false, errors: {}, values, spam: true };

  const parsed = schema.safeParse({ ...values, idempotency_key: str(fd, "idempotency_key") });
  const errors: IntakeErrors = {};
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as IntakeField | "idempotency_key";
      if (field === "idempotency_key") continue;
      const code = (["required", "invalid", "too_long"].includes(issue.message) ? issue.message : "invalid") as ErrorCode;
      errors[field] ??= code;
    }
  }
  const district = values.district.trim();
  if (values.area === "other") {
    if (district.length === 0) errors.district = "required";
    else if (district.length < 2 || district.length > 60) errors.district = "invalid";
  }

  if (!parsed.success || Object.keys(errors).length > 0) {
    return { ok: false, errors, values, spam: false };
  }

  const d = parsed.data;
  return {
    ok: true,
    data: {
      category: d.category,
      area: d.area,
      upazila: d.upazila,
      district: d.area === "other" ? district : null,
      mouza: d.mouza === "" ? null : d.mouza,
      documents: d.documents,
      description: d.description,
      name: d.name,
      phone: normalisePhone(d.phone) as string,
      contact_pref: d.contact_pref,
      idempotency_key: d.idempotency_key,
    },
  };
}
