import type { ReactNode } from "react";

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[var(--container-max)] px-4 sm:px-6 ${className}`}>{children}</div>;
}

export function Eyebrow({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return (
    <p
      className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${
        dark ? "bg-[var(--color-new-bg)] text-[var(--color-primary-300)]" : "bg-accent-soft text-accent"
      }`}
    >
      {children}
    </p>
  );
}

export function SectionHeading({
  id, eyebrow, title, intro, dark = false, center = false,
}: { id: string; eyebrow: string; title: string; intro?: string; dark?: boolean; center?: boolean }) {
  return (
    <div className={`flex max-w-2xl flex-col gap-3 ${center ? "mx-auto items-center text-center" : ""}`}>
      <Eyebrow dark={dark}>{eyebrow}</Eyebrow>
      <h2 id={id} className={`text-[1.75rem] font-bold leading-tight tracking-tight sm:text-4xl ${dark ? "text-[var(--fg-primary)]" : "text-ink"}`}>
        {title}
      </h2>
      {intro && <p className={`text-lg ${dark ? "text-[var(--fg-secondary)]" : "text-muted"}`}>{intro}</p>}
    </div>
  );
}
