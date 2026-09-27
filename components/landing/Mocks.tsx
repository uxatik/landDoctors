// Small product visuals drawn in HTML (step cards, expert card): a few KB instead of images.
// All are marked as samples and hidden from screen readers; each has a visible caption.
import { getTranslations } from "next-intl/server";
import { LineIcon } from "./LineIcon";


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

/** Small visuals on top of each "how it works" card. */
export async function StepVisual({ step }: { step: number }) {
  const t = await mockT();
  const frame = "flex h-36 flex-col justify-center gap-2 rounded-control bg-sunken p-3";
  if (step === 0)
    return (
      <div aria-hidden="true" className={frame}>
        {[t("formName"), t("formPhone"), t("formProblem")].map((l) => (
          <div key={l} className="flex items-center gap-2">
            <span className="w-14 shrink-0 text-xs text-muted">{l}</span>
            <span className="h-6 flex-1 rounded-md bg-surface" />
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
      <div aria-hidden="true" className={frame}>
        {(t.raw("proposalItems") as string[]).map((item) => (
          <div key={item} className="flex items-center gap-2 text-sm text-ink">
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-verified-soft text-verified"><LineIcon name="check" size={12} /></span>
            {item}
          </div>
        ))}
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
      <div className="h-2 w-full overflow-hidden rounded-full bg-surface">
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
    <div aria-hidden="true" className="relative flex flex-col gap-4 rounded-panel bg-surface p-5 shadow-[var(--shadow-lg-light)] sm:p-6">
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
      <ul className="flex flex-col gap-2 pt-1">
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
