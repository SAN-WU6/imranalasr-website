import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageHero from "@/components/PageHero";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, locales, type Locale } from "@/i18n/config";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 3600;
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

const LAST_UPDATED = "2026-07-31";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return {
    ...pageMetadata({
      locale,
      path: "/privacy",
      title: t.privacy.title,
      description: t.privacy.sections[0].p,
    }),
    robots: { index: true, follow: true },
  };
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const t = getDictionary(locale);

  return (
    <>
      <PageHero eyebrow={t.privacy.eyebrow} title={t.privacy.title} />

      <section className="section" data-surface-section="light">
        <div className="page prose-page">
          <p className="prose-updated tabular">
            {t.privacy.updated}: {LAST_UPDATED}
          </p>
          {t.privacy.sections.map((s, i) => (
            <article key={s.h} className="prose-section" data-reveal="up">
              <h2>
                <span className="tabular prose-index">{String(i + 1).padStart(2, "0")}</span>
                {s.h}
              </h2>
              <p>{s.p}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
