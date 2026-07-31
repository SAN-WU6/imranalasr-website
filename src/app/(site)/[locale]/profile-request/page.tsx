import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageHero from "@/components/PageHero";
import ProfileRequestForm from "@/components/forms/ProfileRequestForm";
import CredentialCard from "@/components/CredentialCard";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, locales, type Locale } from "@/i18n/config";
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
  return pageMetadata({
    locale,
    path: "/profile-request",
    title: t.profileRequest.title,
    description: t.profileRequest.lead,
  });
}

export default async function ProfileRequestPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const t = getDictionary(locale);
  const credentials = await resolveCredentials();

  return (
    <>
      <PageHero eyebrow={t.profileRequest.eyebrow} title={t.profileRequest.title} lead={t.profileRequest.lead} />

      <section className="section" data-surface-section="light">
        <div className="page form-layout">
          <div className="form-main">
            <ProfileRequestForm locale={locale} t={t} />
          </div>
          <aside className="form-aside">
            <div className="form-aside-card card" data-reveal="up">
              <h2 className="form-aside-title">{t.quality.isoTitle}</h2>
              <ul className="profile-iso-list">
                {credentials
                  .filter((c) => c.kind === "iso")
                  .map((c) => (
                    <li key={c.id}>
                      <span className="tabular">{c.code[locale]}</span>
                      {c.title[locale]}
                    </li>
                  ))}
              </ul>
            </div>
            <CredentialCard credential={credentials.find((c) => c.id === "commercial-register")!} locale={locale} t={t} />
          </aside>
        </div>
      </section>
    </>
  );
}
