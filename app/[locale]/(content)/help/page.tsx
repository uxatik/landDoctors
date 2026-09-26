import { randomUUID } from "node:crypto";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { isCategory } from "@/lib/content/categories";
import { IntakeForm } from "./IntakeForm";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "help" });
  return { title: t("metaTitle") };
}

export default async function HelpPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { category } = await searchParams;
  const t = await getTranslations("help");

  return (
    <div className="flex flex-col gap-6 pt-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-[length:var(--text-2xl)] font-bold">{t("title")}</h1>
        <p className="text-muted">{t("intro")}</p>
      </div>
      {/* A fresh key per page view: a double tap sends the same key, so only one case is created. */}
      <IntakeForm idempotencyKey={randomUUID()} initialCategory={isCategory(category) ? category : ""} />
    </div>
  );
}
