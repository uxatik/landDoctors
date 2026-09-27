import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { CATEGORY_SLUGS, type CategorySlug } from "@/lib/content/categories";
import { publicEnv } from "@/lib/env";
import { formatPhoneDisplay, toWhatsAppNumber } from "@/lib/phone";
import { formatTaka } from "@/lib/money";
import { MouzaSketch } from "@/components/MouzaSketch";
import { Container, SectionHeading } from "@/components/landing/Section";
import { LineIcon, type IconName } from "@/components/landing/LineIcon";
import { ExpertCardMock, HeroMock, StepVisual } from "@/components/landing/Mocks";

const CATEGORY_ICON: Record<CategorySlug, IconName> = {
  pre_purchase_check: "searchCheck",
  mutation: "stamp",
  survey: "ruler",
  inheritance: "users",
  record_correction: "filePen",
  dispute: "scale",
};
const SAFETY_ICONS: IconName[] = ["banknote", "receipt", "ban", "lock", "refund", "alert"];
const PACKAGE_LINK: (CategorySlug | null)[] = [null, "survey", "pre_purchase_check"];

type Pkg = { name: string; price: number; from: boolean; desc: string; points: string[]; where: string };
type Step = { title: string; body: string };
type Faq = { q: string; a: string };

const BTN = "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 font-semibold no-underline transition-colors duration-150";
const BTN_PRIMARY = `${BTN} bg-accent text-on-accent shadow-[var(--shadow-glow-light)] hover:bg-accent-hover`;
const BTN_SECONDARY = `${BTN} border border-line bg-surface text-ink hover:border-accent hover:text-accent`;

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const bn = locale === "bn";
  const t = await getTranslations("landing");
  const th = await getTranslations("home");
  const tc = await getTranslations("categories");
  const tContact = await getTranslations("contact");
  const tFooter = await getTranslations("footer");
  const tn = await getTranslations("nav");

  const hotline = publicEnv.NEXT_PUBLIC_HOTLINE;
  const waHref = `https://wa.me/${toWhatsAppNumber(publicEnv.NEXT_PUBLIC_WHATSAPP)}?text=${encodeURIComponent(tContact("whatsappText"))}`;
  const assurance = t.raw("hero.assurance") as string[];
  const docs = t.raw("docs.items") as string[];
  const packages = t.raw("pricing.packages") as Pkg[];
  const steps = t.raw("how.steps") as Step[];
  const expertPoints = t.raw("experts.points") as string[];
  const offerPoints = t.raw("pricing.offerPoints") as string[];
  const roles = t.raw("experts.roles") as string[];
  const safety = t.raw("safety.items") as Step[];
  const faqs = t.raw("faq.items") as Faq[];
  const num = (n: number) => new Intl.NumberFormat(bn ? "bn-BD" : "en").format(n);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <div className="relative overflow-x-clip">
      {/* ───────────── Hero: promise, then straight to "what is your problem?" ───────────── */}
      <section aria-labelledby="home-title" className="relative overflow-hidden pb-14 pt-8 sm:pb-20 sm:pt-14">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px]" style={{ background: "var(--gradient-glow)" }} />
        <MouzaSketch className="pointer-events-none absolute -right-10 top-6 -z-10 hidden w-72 text-accent opacity-[0.08] lg:block" />
        <MouzaSketch className="pointer-events-none absolute -left-16 top-40 -z-10 hidden w-60 -scale-x-100 text-accent opacity-[0.06] lg:block" />
        <Container className="flex flex-col items-center gap-5 text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-sm font-semibold text-ink shadow-[var(--shadow-sm-light)]">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-[var(--color-success)] opacity-60 motion-reduce:hidden" />
              <span className="relative inline-flex size-2 rounded-full bg-[var(--color-success)]" />
            </span>
            {th("serving")}
          </p>
          <h1 id="home-title" className="max-w-4xl text-[2rem] font-bold leading-[1.15] tracking-tight text-ink min-[400px]:text-[2.25rem] sm:text-5xl lg:text-[3.5rem] lg:leading-[1.1]">
            <span className="block">{t("hero.titleLead")}</span>{" "}
            <span className="block bg-clip-text text-transparent [-webkit-box-decoration-break:clone] [box-decoration-break:clone]" style={{ backgroundImage: "var(--gradient-brand-text)" }}>
              {t("hero.titleAccent")}
            </span>
          </h1>
          <p className="max-w-2xl text-lg text-muted">{t("hero.intro")}</p>
        </Container>

        <div id="services" className="scroll-mt-20">
          <Container className="mt-10 flex flex-col gap-6 sm:mt-12">
            <div className="flex flex-col items-center gap-1 text-center">
              <h2 id="services-title" className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{t("services.title")}</h2>
              <p className="text-muted">{t("services.intro")}</p>
            </div>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {CATEGORY_SLUGS.map((slug, i) => (
                <li key={slug}>
                  <Link
                    href={{ pathname: "/help", query: { category: slug } }}
                    className="group flex h-full items-center gap-4 rounded-card border border-line bg-surface p-4 text-left no-underline shadow-[var(--shadow-sm-light)] transition hover:border-accent hover:shadow-[var(--shadow-md-light)] sm:p-5"
                  >
                    <span
                      className={`flex size-12 shrink-0 items-center justify-center rounded-control transition-colors ${
                        i === 0 ? "text-white" : "bg-accent-soft text-accent group-hover:bg-accent group-hover:text-on-accent"
                      }`}
                      style={i === 0 ? { background: "var(--gradient-brand-deep)" } : undefined}
                    >
                      <LineIcon name={CATEGORY_ICON[slug]} size={24} />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="text-lg font-semibold text-ink">{tc(`${slug}.name`)}</span>
                      <span className="text-sm text-muted">{tc(`${slug}.hint`)}</span>
                    </span>
                    <LineIcon name="arrowRight" size={20} className="shrink-0 text-accent transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </li>
              ))}
            </ul>
            <p className="flex flex-col items-center gap-1 text-center text-sm text-muted sm:flex-row sm:justify-center sm:gap-2">
              <span className="inline-flex items-center gap-1.5"><LineIcon name="mapPin" size={16} className="hidden shrink-0 text-accent sm:block" /> {t("services.note")}</span>
              <Link href="/help" className="font-semibold text-accent no-underline hover:underline">{t("services.waitlist")}</Link>
            </p>

            <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 rounded-panel border border-line bg-surface p-5 sm:flex-row sm:justify-between sm:p-6">
              <p className="text-center font-semibold text-ink sm:text-left">{t("services.orTalk")}</p>
              <div className="grid w-full grid-cols-2 gap-3 sm:flex sm:w-auto">
                <a href={`tel:${hotline}`} className={`${BTN_PRIMARY} px-4`}>
                  <LineIcon name="phone" size={18} /> {tContact("call")}
                </a>
                <a href={waHref} target="_blank" rel="noopener noreferrer" className={`${BTN_SECONDARY} px-4`}>
                  {tContact("whatsapp")}
                </a>
              </div>
            </div>
            <p dir="ltr" className="-mt-2 text-center text-sm font-semibold text-ink">{formatPhoneDisplay(hotline)}</p>
            <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-muted">
              {assurance.map((a) => (
                <li key={a} className="flex items-center gap-1.5">
                  <LineIcon name="check" size={16} className="text-verified" />
                  {a}
                </li>
              ))}
            </ul>
          </Container>
        </div>
      </section>

      {/* ───────────── Papers strip ───────────── */}
      <section aria-labelledby="docs-title" className="border-y border-line bg-surface py-8">
        <Container className="flex flex-col items-center gap-5">
          <h2 id="docs-title" className="text-sm font-semibold text-muted">{t("docs.title")}</h2>
          <ul className="grid w-full grid-cols-2 gap-x-4 gap-y-3 sm:flex sm:flex-wrap sm:justify-center sm:gap-x-8">
            {docs.map((d) => (
              <li key={d} className="flex items-center gap-2 text-sm font-semibold text-[var(--color-neutral-600)] sm:text-base">
                <LineIcon name="file" size={18} className="text-[var(--color-neutral-400)]" />
                {d}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* ───────────── How it works ───────────── */}
      <section id="how" aria-labelledby="how-title" className="scroll-mt-20 py-16 sm:py-24">
        <Container className="flex flex-col gap-10">
          <SectionHeading id="how-title" eyebrow={t("how.eyebrow")} title={t("how.title")} />
          <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <li key={s.title} className="flex flex-col gap-4 rounded-card border border-line bg-surface p-4">
                <StepVisual step={i} />
                <div className="flex flex-col gap-1.5 px-1 pb-1">
                  <span className="text-sm font-semibold text-accent">
                    {bn ? "ধাপ" : "Step"} {num(i + 1)}
                  </span>
                  <h3 className="text-lg font-semibold text-ink">{s.title}</h3>
                  <p className="text-sm text-muted">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* ───────────── Pricing ───────────── */}
      <section id="pricing" aria-labelledby="pricing-title" className="scroll-mt-20 border-t border-line bg-surface py-16 sm:py-24">
        <Container className="flex flex-col gap-10">
          <SectionHeading id="pricing-title" eyebrow={t("pricing.eyebrow")} title={t("pricing.title")} intro={t("pricing.intro")} />
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {packages.map((p, i) => {
              const featured = i === 2;
              const cat = PACKAGE_LINK[i];
              const price = formatTaka(p.price);
              return (
                <li
                  key={p.name}
                  className={`relative flex flex-col gap-4 rounded-card p-6 ${
                    featured ? "border-2 border-accent bg-surface shadow-[var(--shadow-lg-light)]" : "border border-line bg-bg"
                  }`}
                >
                  {featured && (
                    <span className="absolute -top-3 left-6 rounded-full px-3 py-0.5 text-xs font-semibold text-white" style={{ background: "var(--gradient-brand-deep)" }}>
                      {t("pricing.popular")}
                    </span>
                  )}
                  <h3 className="text-lg font-semibold text-ink">{p.name}</h3>
                  <p className="flex items-baseline gap-1.5 text-ink">
                    {p.from && !bn && <span className="text-sm text-muted">{t("pricing.from")}</span>}
                    <span className="text-4xl font-bold tracking-tight">{price}</span>
                    {p.from && bn && <span className="text-sm text-muted">{t("pricing.from")}</span>}
                  </p>
                  <p className="text-muted">{p.desc}</p>
                  <ul className="flex flex-col gap-2 border-t border-line pt-4">
                    {p.points.map((pt) => (
                      <li key={pt} className="flex gap-2 text-sm text-ink">
                        <LineIcon name="check" size={18} className="mt-0.5 shrink-0 text-accent" />
                        {pt}
                      </li>
                    ))}
                    <li className="flex gap-2 text-sm text-ink">
                      <LineIcon name="mapPin" size={18} className="mt-0.5 shrink-0 text-accent" />
                      {p.where}
                    </li>
                  </ul>
                  <Link
                    href={cat ? { pathname: "/help", query: { category: cat } } : { pathname: "/help" }}
                    className={`mt-auto ${featured ? BTN_PRIMARY : BTN_SECONDARY}`}
                    aria-label={`${p.name}: ${t("pricing.choose")}`}
                  >
                    {t("pricing.choose")}
                  </Link>
                </li>
              );
            })}
          </ul>
          <p className="flex max-w-3xl gap-2 text-sm text-muted">
            <LineIcon name="receipt" size={18} className="mt-0.5 shrink-0" />
            {t("pricing.note")}
          </p>
          <div className="mt-6 grid items-center gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-14">
            <div className="flex flex-col gap-4">
              <h3 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{t("pricing.offerTitle")}</h3>
              <ul className="flex flex-col gap-3">
                {offerPoints.map((pt) => (
                  <li key={pt} className="flex gap-3 text-ink">
                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent"><LineIcon name="check" size={14} /></span>
                    {pt}
                  </li>
                ))}
              </ul>
            </div>
            <HeroMock />
          </div>
        </Container>
      </section>

      {/* ───────────── Experts ───────────── */}
      <section aria-labelledby="experts-title" className="overflow-x-clip border-t border-line bg-surface py-16 sm:py-24">
        <Container className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-6">
            <SectionHeading id="experts-title" eyebrow={t("experts.eyebrow")} title={t("experts.title")} intro={t("experts.intro")} />
            <ul className="flex flex-col gap-3">
              {expertPoints.map((p) => (
                <li key={p} className="flex gap-3 text-ink">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent"><LineIcon name="check" size={14} /></span>
                  {p}
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold text-muted">{t("experts.rolesTitle")}</p>
              <ul className="flex flex-wrap gap-2">
                {roles.map((r) => (
                  <li key={r} className="rounded-full border border-line bg-bg px-3 py-1 text-sm text-ink">{r}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-md">
            <div aria-hidden="true" className="absolute -inset-6 -z-10 rounded-[40px] opacity-70" style={{ background: "var(--gradient-glow)" }} />
            <ExpertCardMock />
          </div>
        </Container>
      </section>

      {/* ───────────── Safety (Designfoli dark theme) ───────────── */}
      <section data-theme="dark" aria-labelledby="safety-title" className="relative overflow-hidden bg-[var(--bg-base)] py-16 sm:py-24">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-80" style={{ background: "var(--gradient-glow)" }} />
        <Container className="relative flex flex-col gap-10">
          <SectionHeading id="safety-title" dark eyebrow={t("safety.eyebrow")} title={t("safety.title")} />
          <ul className="grid grid-cols-1 gap-px overflow-hidden rounded-card border border-[var(--border-default)] bg-[var(--border-default)] sm:grid-cols-2 lg:grid-cols-3">
            {safety.map((s, i) => (
              <li key={s.title} className="flex flex-col gap-3 bg-[var(--bg-base)] p-6">
                <span className="flex size-10 items-center justify-center rounded-control bg-[var(--bg-elevated)] text-[var(--color-primary-300)]">
                  <LineIcon name={SAFETY_ICONS[i] ?? "check"} size={20} />
                </span>
                <h3 className="text-lg font-semibold text-[var(--fg-primary)]">{s.title}</h3>
                <p className="text-[var(--fg-secondary)]">{s.body}</p>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-3 text-sm text-[var(--fg-secondary)] sm:flex-row sm:items-center sm:justify-between">
            <p>{tFooter("note")}</p>
            <Link href="/legal/refund" className="font-semibold text-[var(--color-primary-300)] no-underline hover:underline">
              {t("safety.refundLink")}
            </Link>
          </div>
        </Container>
      </section>

      {/* ───────────── Living abroad ───────────── */}
      <section aria-labelledby="nrb-title" className="py-16 sm:py-20">
        <Container>
          <div className="flex flex-col gap-5 rounded-panel border border-line bg-surface p-6 sm:flex-row sm:items-center sm:gap-8 sm:p-8">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
              <LineIcon name="globe" size={28} />
            </span>
            <div className="flex flex-1 flex-col gap-2">
              <h2 id="nrb-title" className="text-xl font-semibold text-ink sm:text-2xl">{t("nrb.title")}</h2>
              <p className="text-muted">{t("nrb.body")}</p>
            </div>
            <a href={waHref} target="_blank" rel="noopener noreferrer" className={`${BTN_SECONDARY} shrink-0`}>
              {t("nrb.cta")}
            </a>
          </div>
        </Container>
      </section>

      {/* ───────────── FAQ ───────────── */}
      <section id="faq" aria-labelledby="faq-title" className="scroll-mt-20 border-t border-line bg-surface py-16 sm:py-24">
        <Container className="grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
          <div className="contents lg:flex lg:flex-col lg:gap-6">
            <SectionHeading id="faq-title" eyebrow={t("faq.eyebrow")} title={t("faq.title")} />
            <div className="order-last flex flex-col gap-3 rounded-card bg-sunken p-5 lg:order-none">
              <p className="font-semibold text-ink">{th("orTalk")}</p>
              <div className="flex flex-wrap gap-3">
                <a href={`tel:${hotline}`} className={`${BTN} min-h-11 bg-accent px-5 text-on-accent hover:bg-accent-hover`}>
                  <LineIcon name="phone" size={18} /> {tContact("call")}
                </a>
                <a href={waHref} target="_blank" rel="noopener noreferrer" className={`${BTN} min-h-11 border border-accent px-5 text-accent hover:bg-accent-soft`}>
                  {tContact("whatsapp")}
                </a>
              </div>
              <p dir="ltr" className="text-sm font-semibold text-ink [text-align:start]">{formatPhoneDisplay(hotline)}</p>
            </div>
          </div>
          <div className="flex flex-col divide-y divide-line border-y border-line">
            {faqs.map((f) => (
              <details key={f.q} className="group py-1">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 text-lg font-semibold text-ink [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-line text-muted transition-transform duration-200 group-open:rotate-45">
                    <LineIcon name="plus" size={16} />
                  </span>
                </summary>
                <p className="pb-4 pr-12 text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </Container>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }} />
      </section>

      {/* ───────────── Final call to action ───────────── */}
      <section aria-labelledby="cta-title" className="py-16 sm:py-20">
        <Container>
          <div className="relative flex flex-col items-center gap-5 overflow-hidden rounded-panel px-6 py-12 text-center text-white sm:py-16" style={{ background: "var(--gradient-brand-deep)" }}>
            <MouzaSketch className="pointer-events-none absolute -right-6 -top-4 w-64 text-white opacity-[0.12]" />
            <MouzaSketch className="pointer-events-none absolute -bottom-10 -left-8 w-56 text-white opacity-[0.08]" />
            <p className="relative rounded-full bg-white/15 px-3 py-1 text-sm font-semibold text-white">{th("serving")}</p>
            <h2 id="cta-title" className="relative max-w-2xl text-3xl font-bold leading-tight tracking-tight sm:text-5xl">{t("cta.title")}</h2>
            <p className="relative max-w-xl text-lg text-white/90">{t("cta.body")}</p>
            <div className="relative flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link href="/help" className={`${BTN} bg-white text-[var(--color-primary-700)] hover:bg-[var(--color-primary-100)]`}>{t("hero.primary")}</Link>
              <a href={`tel:${hotline}`} className={`${BTN} border border-white/60 text-white hover:bg-white/10`}>
                <LineIcon name="phone" size={18} /> {tContact("call")}
              </a>
            </div>
          </div>
        </Container>
      </section>

      {/* Phones: call and form always one tap away. Sticky inside the page, so it never covers the footer. */}
      <nav aria-label={t("bar.label")} className="sticky bottom-0 z-30 border-t border-line bg-[color-mix(in_srgb,var(--color-surface)_92%,transparent)] px-4 py-3 backdrop-blur-md sm:hidden">
        <div className="grid grid-cols-2 gap-3">
          <a href={`tel:${hotline}`} className={`${BTN_SECONDARY} px-3`}>
            <LineIcon name="phone" size={18} /> {tContact("call")}
          </a>
          <Link href="/help" className={`${BTN_PRIMARY} px-3`}>{tn("start")} →</Link>
        </div>
      </nav>
    </div>
  );
}
