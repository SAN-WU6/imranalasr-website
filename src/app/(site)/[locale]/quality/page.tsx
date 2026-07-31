import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageHero from "@/components/PageHero";
import CredentialCard from "@/components/CredentialCard";
import { MaskLines } from "@/components/MaskLines";
import { getDictionary } from "@/i18n/dictionaries";
import { href, isLocale, locales, type Locale } from "@/i18n/config";
import { pageMetadata } from "@/lib/seo";
import { resolveCredentials } from "@/lib/content";

export const revalidate = 300;
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return pageMetadata({ locale, path: "/quality", title: t.quality.title, description: t.quality.lead });
}

export default async function QualityPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const t = getDictionary(locale);
  const credentials = await resolveCredentials();
  const iso = credentials.filter((c) => c.kind === "iso");
  const others = credentials.filter((c) => c.kind !== "iso");

  return (
    <>
      <PageHero eyebrow={t.quality.eyebrow} title={t.quality.title} lead={t.quality.lead} />

      <section className="section" data-surface-section="light">
        <div className="page">
          <div className="section-head">
            <p className="eyebrow" data-reveal="up">
              {t.quality.isoTitle}
            </p>
            <MaskLines as="h2" className="section-title" lines={[t.quality.isoTitle]} />
          </div>
          <div className="cred-grid" data-reveal-group="">
            {iso.map((c) => (
              <CredentialCard key={c.id} credential={c} locale={locale} t={t} detailed />
            ))}
          </div>
        </div>
      </section>

      <section className="section" data-surface="paper-deep" data-surface-section="light">
        <div className="page">
          <div className="section-head">
            <p className="eyebrow" data-reveal="up">
              {t.quality.registrationsTitle}
            </p>
            <MaskLines as="h2" className="section-title" lines={[t.quality.registrationsTitle]} />
          </div>
          <div className="cred-grid" data-reveal-group="">
            {others.map((c) => (
              <CredentialCard key={c.id} credential={c} locale={locale} t={t} />
            ))}
          </div>
        </div>
      </section>

      <section className="section" data-surface="ink" data-surface-section="ink">
        <div className="page">
          <div className="section-head">
            <p className="eyebrow" data-reveal="up">
              {t.quality.policyTitle}
            </p>
            <MaskLines as="h2" className="section-title" lines={[t.quality.policyTitle]} />
          </div>
          <div className="policy-grid" data-reveal-group="">
            {t.quality.policyItems.map((p, i) => (
              <article key={p.title} className="policy-card" data-reveal="up">
                <span className="tabular policy-index">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="policy-title">{p.title}</h3>
                <p className="policy-body">{p.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" data-surface-section="light">
        <div className="page profile-cta card" data-reveal="up">
          <div>
            <p className="eyebrow">{t.about.profileTitle}</p>
            <h2 className="profile-cta-title">{t.about.profileTitle}</h2>
            <p className="profile-cta-body">{t.about.profileLead}</p>
          </div>
          <Link href={href("/profile-request", locale)} className="btn">
            {t.common.requestProfile}
            <span className="arrow" aria-hidden="true">
              {locale === "ar" ? "←" : "→"}
            </span>
          </Link>
        </div>
      </section>
    </>
  );
}
