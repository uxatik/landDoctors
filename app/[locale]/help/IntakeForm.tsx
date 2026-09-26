"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import { CATEGORY_SLUGS } from "@/lib/content/categories";
import { AREAS, CONTACT_PREFS, DOCUMENTS, type IntakeField } from "@/lib/validation/intake";
import { submitIntake, type IntakeState } from "./actions";

const FIELD_ORDER: IntakeField[] = [
  "category", "area", "district", "upazila", "mouza", "documents", "description", "name", "phone", "contact_pref",
];

// Where the error summary links to for each field.
const FIELD_ANCHOR: Record<IntakeField, string> = {
  category: "category-pre_purchase_check",
  area: "area-savar",
  upazila: "upazila",
  district: "district",
  mouza: "mouza",
  documents: "doc-deed",
  description: "description",
  name: "name",
  phone: "phone",
  contact_pref: "contact-call",
};

const INPUT =
  "w-full rounded-sm border border-line bg-surface px-3 py-2.5 text-base text-ink aria-[invalid=true]:border-danger";
const CHOICE =
  "flex min-h-[var(--tap-min)] cursor-pointer items-center gap-3 rounded-sm border border-line bg-surface px-3 py-2 has-[:checked]:border-accent has-[:checked]:bg-accent-soft";

function SubmitButton() {
  const t = useTranslations("help");
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className="min-h-[var(--tap-min)] w-full rounded-md bg-accent px-4 font-semibold text-on-accent hover:bg-accent-hover disabled:opacity-70"
    >
      {pending ? t("submitting") : t("submit")}
    </button>
  );
}

export function IntakeForm({ idempotencyKey, initialCategory }: { idempotencyKey: string; initialCategory: string }) {
  const t = useTranslations("help");
  const tc = useTranslations("categories");
  const [state, formAction] = useActionState<IntakeState, FormData>(submitIntake, { status: "idle", errors: {} });
  const summaryRef = useRef<HTMLDivElement>(null);
  const v = state.values;
  const errors = state.errors;
  const errorFields = FIELD_ORDER.filter((f) => errors[f]);

  useEffect(() => {
    if (state.status === "error") summaryRef.current?.focus();
  }, [state]);

  const err = (f: IntakeField) =>
    errors[f] ? (
      <p id={`${f}-error`} className="text-sm font-medium text-danger">
        {t(`errors.${f}.${errors[f]}`)}
      </p>
    ) : null;
  const describedBy = (f: IntakeField, hint?: string) =>
    [hint, errors[f] ? `${f}-error` : undefined].filter(Boolean).join(" ") || undefined;

  const category = v?.category ?? initialCategory;

  return (
    <form action={formAction} noValidate className="intake flex flex-col gap-8">
      {(errorFields.length > 0 || state.formError) && (
        <div id="form-errors" ref={summaryRef} tabIndex={-1} role="alert" className="flex flex-col gap-2 rounded-md border-2 border-danger bg-danger-soft p-4">
          {state.formError ? (
            <p className="font-semibold">{t(`formErrors.${state.formError}`)}</p>
          ) : (
            <>
              <p className="font-semibold">{t("summaryTitle")}</p>
              <ul className="list-disc pl-5">
                {errorFields.map((f) => (
                  <li key={f}>
                    <a href={`#${FIELD_ANCHOR[f]}`} className="text-danger underline">
                      {t(`errors.${f}.${errors[f]}`)}
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      <input type="hidden" name="idempotency_key" value={idempotencyKey} />
      {/* Honeypot: people never see or fill this. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      <fieldset className="flex flex-col gap-2" aria-describedby={describedBy("category")}>
        <legend className="mb-2 text-lg font-semibold">{t("categoryLegend")}</legend>
        {err("category")}
        <div className="grid grid-cols-1 gap-2 min-[400px]:grid-cols-2">
          {CATEGORY_SLUGS.map((c) => (
            <label key={c} className={CHOICE}>
              <input
                type="radio"
                id={`category-${c}`}
                name="category"
                value={c}
                defaultChecked={category === c}
                className="size-5 accent-[var(--color-accent)]"
              />
              <span>{tc(`${c}.name`)}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-2 text-lg font-semibold">{t("whereLegend")}</legend>
        {err("area")}
        <div className="grid grid-cols-3 gap-2">
          {AREAS.map((a) => (
            <label key={a} className={CHOICE}>
              <input
                type="radio"
                id={`area-${a}`}
                name="area"
                value={a}
                defaultChecked={v?.area === a}
                aria-describedby={describedBy("area")}
                className="size-5 accent-[var(--color-accent)]"
              />
              <span>{t(`areas.${a}`)}</span>
            </label>
          ))}
        </div>

        <p className="field-note hidden rounded-md bg-warning-soft p-3 text-sm" role="note">
          {t("fieldNote")}
        </p>

        <div className="district-field hidden flex-col gap-1">
          <label htmlFor="district" className="font-medium">{t("district")}</label>
          <input id="district" name="district" className={INPUT} defaultValue={v?.district} autoComplete="address-level1"
            aria-invalid={!!errors.district} aria-describedby={describedBy("district")} maxLength={60} />
          {err("district")}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="upazila" className="font-medium">{t("upazila")}</label>
          <input id="upazila" name="upazila" className={INPUT} defaultValue={v?.upazila} list="upazila-list" autoComplete="address-level2"
            aria-invalid={!!errors.upazila} aria-describedby={describedBy("upazila", "upazila-hint")} maxLength={60} />
          <p id="upazila-hint" className="text-sm text-muted">{t("upazilaHint")}</p>
          {err("upazila")}
          <datalist id="upazila-list">
            {["সাভার", "আশুলিয়া", "গাজীপুর সদর", "টঙ্গী", "কালিয়াকৈর", "কালীগঞ্জ", "কাপাসিয়া", "শ্রীপুর",
              "Savar", "Ashulia", "Gazipur Sadar", "Tongi", "Kaliakair", "Kaliganj", "Kapasia", "Sreepur"].map((u) => (
              <option key={u} value={u} />
            ))}
          </datalist>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="mouza" className="font-medium">{t("mouza")}</label>
          <input id="mouza" name="mouza" className={INPUT} defaultValue={v?.mouza} maxLength={60}
            aria-invalid={!!errors.mouza} aria-describedby={describedBy("mouza")} />
          {err("mouza")}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-2" aria-describedby="docs-hint">
        <legend className="mb-1 text-lg font-semibold">{t("docsLegend")}</legend>
        <p id="docs-hint" className="text-sm text-muted">{t("docsHint")}</p>
        {err("documents")}
        <div className="grid grid-cols-1 gap-2 min-[400px]:grid-cols-2">
          {DOCUMENTS.map((d) => (
            <label key={d} className={CHOICE}>
              <input type="checkbox" id={`doc-${d}`} name="documents" value={d} defaultChecked={v?.documents.includes(d)}
                className="size-5 accent-[var(--color-accent)]" />
              <span>{t(`docs.${d}`)}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-1">
        <label htmlFor="description" className="text-lg font-semibold">{t("description")}</label>
        <p id="description-hint" className="text-sm text-muted">{t("descriptionHint")}</p>
        <textarea id="description" name="description" rows={4} maxLength={1000} className={INPUT} defaultValue={v?.description}
          aria-invalid={!!errors.description} aria-describedby={describedBy("description", "description-hint")} />
        {err("description")}
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-2 text-lg font-semibold">{t("aboutLegend")}</legend>
        <div className="flex flex-col gap-1">
          <label htmlFor="name" className="font-medium">{t("name")}</label>
          <input id="name" name="name" className={INPUT} defaultValue={v?.name} autoComplete="name" maxLength={80}
            aria-invalid={!!errors.name} aria-describedby={describedBy("name")} />
          {err("name")}
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="phone" className="font-medium">{t("phone")}</label>
          <input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" dir="ltr" className={`${INPUT} tabular-nums`}
            defaultValue={v?.phone} maxLength={20} aria-invalid={!!errors.phone} aria-describedby={describedBy("phone", "phone-hint")} />
          <p id="phone-hint" className="text-sm text-muted">{t("phoneHint")}</p>
          {err("phone")}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-lg font-semibold">{t("contactLegend")}</legend>
        {err("contact_pref")}
        <div className="grid grid-cols-2 gap-2">
          {CONTACT_PREFS.map((c) => (
            <label key={c} className={CHOICE}>
              <input type="radio" id={`contact-${c}`} name="contact_pref" value={c} defaultChecked={(v?.contact_pref ?? "call") === c}
                className="size-5 accent-[var(--color-accent)]" />
              <span>{t(`contact.${c}`)}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted">{t("privacy")}</p>
        <SubmitButton />
      </div>
    </form>
  );
}
