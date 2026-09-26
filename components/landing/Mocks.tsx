// Product "screenshots" drawn in HTML: they show what a customer actually gets
// (offer, case status, expert card) and weigh a few KB instead of large images.
// All are marked as samples and hidden from screen readers; each has a visible caption.
import { getTranslations } from "next-intl/server";
import { formatTaka } from "@/lib/money";
import { LineIcon } from "./LineIcon";

const SERVICE = 8000;
const GOVT = 450;

async function mockT() {
  return getTranslations("landing.mock");
}

function Verified({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-verified-soft px-2 py-0.5 text-xs font-semibold text-verified">
      <LineIcon name="badgeCheck" size={14} /> {label}
    </span>
  );
}

export async function OfferMock({ compact = false }: { compact?: boolean }) {
  const t = await mockT();
  return (
    <div className="flex flex-col gap-3 rounded-card border border-line bg-surface p-4 shadow-[var(--shadow-md-light)] sm:p-5">
      <div className="flex items-center justify-between gap-2 text-xs text-muted">
        <span>
          {t("case")} <span dir="ltr" className="font-semibold text-ink">LD-0142</span>
        </span>
        <span className="rounded-full bg-sunken px-2 py-0.5 font-semibold">{t("sample")}</span>
      </div>
      <p className="text-xl font-bold text-ink">{t("offerTitle")}</p>
      <div className="flex flex-col gap-1 rounded-control bg-sunken p-3">
        <p className="font-semibold text-ink">{t("package")}</p>
        {!compact && <p className="hidden text-sm text-muted sm:block">{t("scope")}</p>}
        <p className="flex items-center gap-1.5 text-sm text-muted">
          <LineIcon name="clock" size={14} /> {t("delivery")}
        </p>
      </div>
      <dl className="flex flex-col gap-1.5 text-sm">
        <div className="flex justify-between gap-3"><dt className="text-muted">{t("service")}</dt><dd className="font-medium text-ink">{formatTaka(SERVICE)}</dd></div>
        <div className="flex justify-between gap-3"><dt className="text-muted">{t("govt")}</dt><dd className="font-medium text-ink">{formatTaka(GOVT)}</dd></div>
        <div className="flex justify-between gap-3 border-t border-line pt-2 text-base font-bold text-ink"><dt>{t("total")}</dt><dd>{formatTaka(SERVICE + GOVT)}</dd></div>
      </dl>
      <div className="hidden items-center gap-3 border-t border-line pt-3 sm:flex">
        <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: "var(--gradient-brand-deep)" }}>
          <LineIcon name="ruler" size={16} />
        </span>
        <div className="flex min-w-0 flex-col">
          <span className="text-xs text-muted">{t("expertLabel")}</span>
          <span className="truncate text-sm font-semibold text-ink">{t("expertRole")}</span>
        </div>
        <span className="ml-auto"><Verified label={t("verified")} /></span>
      </div>
      <span className="mt-1 flex h-11 items-center justify-center rounded-full bg-accent text-sm font-semibold text-on-accent">{t("pay")}</span>
    </div>
  );
}

export async function StatusMock() {
  const t = await mockT();
  const statuses = t.raw("statuses") as string[];
  return (
    <div className="flex flex-col gap-3 rounded-card border border-line bg-surface p-4 shadow-[var(--shadow-md-light)]">
      <p className="text-sm font-semibold text-ink">{t("statusTitle")}</p>
      <ol className="flex flex-col">
        {statuses.map((s, i) => {
          const last = i === statuses.length - 1;
          return (
            <li key={s} className="relative flex gap-3 pb-3 last:pb-0">
              {!last && <span className="absolute left-[9px] top-5 h-full w-px bg-line" />}
              <span className={`relative z-10 flex size-5 shrink-0 items-center justify-center rounded-full ${last ? "border-2 border-accent bg-surface" : "bg-accent text-on-accent"}`}>
                {!last && <LineIcon name="check" size={12} />}
              </span>
              <span className={`text-sm ${last ? "font-semibold text-accent" : "text-ink"}`}>
                {s}
                {last && <span className="ml-2 rounded-full bg-accent-soft px-2 py-0.5 text-xs">{t("now")}</span>}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export async function CallMock() {
  const t = await mockT();
  return (
    <div className="flex items-center gap-3 rounded-card border border-line bg-surface p-4 shadow-[var(--shadow-md-light)]">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-verified-soft text-verified">
        <LineIcon name="phone" size={18} />
      </span>
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-ink">{t("callTitle")}</span>
        <span className="text-xs text-muted">{t("callBody")}</span>
      </div>
    </div>
  );
}

export async function PaymentMock() {
  const t = await mockT();
  const methods = t.raw("payMethods") as string[];
  return (
    <div className="flex flex-col gap-3 rounded-card border border-line bg-surface p-4 shadow-[var(--shadow-md-light)]">
      <p className="flex items-center gap-2 text-sm font-semibold text-ink">
        <LineIcon name="lock" size={16} className="text-accent" /> {t("payTitle")}
      </p>
      <div className="grid grid-cols-4 gap-2">
        {methods.map((m) => (
          <span key={m} className="flex h-9 items-center justify-center rounded-control border border-line bg-bg text-xs font-semibold text-ink">{m}</span>
        ))}
      </div>
      <p className="flex items-center gap-1.5 text-xs text-muted"><LineIcon name="receipt" size={14} /> {t("payNote")}</p>
    </div>
  );
}

export async function HeroMock() {
  const t = await mockT();
  return (
    <figure aria-labelledby="hero-mock-cap" className="relative mx-auto w-full max-w-5xl">
      <div aria-hidden="true" className="pointer-events-none absolute -inset-x-10 -top-10 bottom-10 -z-10 rounded-[48px] opacity-60" style={{ background: "var(--gradient-glow)" }} />
      <div aria-hidden="true" className="overflow-hidden rounded-panel border border-line bg-surface shadow-[var(--shadow-xl-light)]">
        <div className="flex items-center gap-2 border-b border-line bg-surface px-4 py-2.5">
          <span className="size-2.5 rounded-full bg-[var(--color-neutral-200)]" />
          <span className="size-2.5 rounded-full bg-[var(--color-neutral-200)]" />
          <span className="size-2.5 rounded-full bg-[var(--color-neutral-200)]" />
          <span dir="ltr" className="mx-auto truncate rounded-full bg-sunken px-4 py-1 text-xs text-muted">landdoctor.com.bd/offer/…</span>
        </div>
        <div className="grid gap-4 bg-sunken p-4 sm:p-6 md:grid-cols-[1.35fr_1fr]">
          <OfferMock />
          <div className="hidden flex-col gap-4 md:flex">
            <StatusMock />
            <CallMock />
            <PaymentMock />
          </div>
        </div>
      </div>
      <figcaption id="hero-mock-cap" className="mt-3 text-center text-sm text-muted">{t("label")}</figcaption>
    </figure>
  );
}

/** Small visuals on top of each "how it works" card. */
export async function StepVisual({ step }: { step: number }) {
  const t = await mockT();
  const frame = "flex h-36 flex-col justify-center gap-2 rounded-control border border-line bg-surface p-3";
  if (step === 0)
    return (
      <div aria-hidden="true" className={frame}>
        {[t("formName"), t("formPhone"), t("formProblem")].map((l) => (
          <div key={l} className="flex items-center gap-2">
            <span className="w-14 shrink-0 text-xs text-muted">{l}</span>
            <span className="h-6 flex-1 rounded-md border border-line bg-bg" />
          </div>
        ))}
        <span className="ml-auto h-6 w-20 rounded-full bg-accent" />
      </div>
    );
  if (step === 1)
    return (
      <div aria-hidden="true" className={`${frame} items-center`}>
        <span className="relative flex size-12 items-center justify-center rounded-full bg-verified-soft text-verified">
          <span className="absolute inset-0 rounded-full ring-8 ring-[var(--color-success-bg)]" />
          <LineIcon name="phone" size={20} />
        </span>
        <span className="text-sm font-semibold text-ink">{t("callTitle")}</span>
        <span className="text-xs text-muted">{t("callBody")}</span>
      </div>
    );
  if (step === 2)
    return (
      <div aria-hidden="true" className={`${frame} text-xs`}>
        <div className="flex justify-between"><span className="text-muted">{t("service")}</span><span className="font-medium text-ink">{formatTaka(SERVICE)}</span></div>
        <div className="flex justify-between"><span className="text-muted">{t("govt")}</span><span className="font-medium text-ink">{formatTaka(GOVT)}</span></div>
        <div className="flex justify-between border-t border-line pt-2 text-sm font-bold text-ink"><span>{t("total")}</span><span>{formatTaka(SERVICE + GOVT)}</span></div>
      </div>
    );
  return (
    <div aria-hidden="true" className={frame}>
      <div className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-full text-white" style={{ background: "var(--gradient-brand-deep)" }}>
          <LineIcon name="ruler" size={14} />
        </span>
        <span className="text-sm font-semibold text-ink">{t("expertRole")}</span>
      </div>
      <Verified label={t("verified")} />
      <div className="h-2 w-full overflow-hidden rounded-full bg-sunken">
        <span className="block h-full w-2/3 rounded-full" style={{ background: "var(--gradient-primary)" }} />
      </div>
      <span className="text-xs font-semibold text-accent">{(t.raw("statuses") as string[])[3]}</span>
    </div>
  );
}

export async function ExpertCardMock() {
  const t = await mockT();
  const te = await getTranslations("landing.experts");
  const checks = te.raw("cardChecks") as string[];
  return (
    <div aria-hidden="true" className="relative flex flex-col gap-4 rounded-panel border border-line bg-surface p-5 shadow-[var(--shadow-lg-light)] sm:p-6">
      <span className="absolute right-4 top-4 rounded-full bg-sunken px-2 py-0.5 text-xs font-semibold text-muted">{t("sample")}</span>
      <div className="flex items-center gap-3">
        <span className="flex size-14 items-center justify-center rounded-full text-white" style={{ background: "var(--gradient-brand-deep)" }}>
          <LineIcon name="ruler" size={24} />
        </span>
        <div className="flex flex-col gap-1">
          <span className="text-lg font-semibold text-ink">{t("expertRole")}</span>
          <Verified label={t("verified")} />
        </div>
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
        <dt className="text-muted">{te("cardAreas")}</dt><dd className="font-medium text-ink">{te("cardAreasValue")}</dd>
        <dt className="text-muted">{te("cardSkills")}</dt><dd className="font-medium text-ink">{te("cardSkillsValue")}</dd>
      </dl>
      <ul className="flex flex-col gap-2 border-t border-line pt-4">
        {checks.map((c) => (
          <li key={c} className="flex items-center gap-2 text-sm text-ink">
            <span className="flex size-5 items-center justify-center rounded-full bg-verified-soft text-verified"><LineIcon name="check" size={12} /></span>
            {c}
          </li>
        ))}
      </ul>
    </div>
  );
}
