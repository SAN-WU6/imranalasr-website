import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import PageHero from "@/components/PageHero";
import { MaskLines } from "@/components/MaskLines";
import { getDictionary } from "@/i18n/dictionaries";
import { href, isLocale, locales, type Locale } from "@/i18n/config";
import { pageMetadata } from "@/lib/seo";
import { resolveCompany, resolveProjects } from "@/lib/content";
import { totalRegisteredActivities } from "@/content/services";

export const revalidate = 300;
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return pageMetadata({ locale, path: "/about", title: t.nav.about, description: t.about.lead });
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const t = getDictionary(locale);
  const c = await resolveCompany();
  const projects = await resolveProjects();
  const regions = Array.from(new Set(projects.map((p) => p.location[locale])));

  const identity: [string, string][] = [
    [locale === "ar" ? "الاسم النظامي" : "Registered name", c.name[locale]],
    [locale === "ar" ? "نوع الكيان" : "Entity type", c.legalForm[locale]],
    [locale === "ar" ? "السجل التجاري" : "Commercial register", c.commercialRegistration],
    [locale === "ar" ? "تاريخ القيد" : "Registered on", c.crIssueDate],
    [locale === "ar" ? "الرقم الوطني الموحد" : "Unified national number", c.unifiedNationalNumber],
    [locale === "ar" ? "الرقم الضريبي" : "VAT number", c.vatNumber],
    [locale === "ar" ? "عضوية الغرفة" : "Chamber membership", c.chamber.membershipNumber],
    [locale === "ar" ? "درجة العضوية" : "Membership class", c.chamber.class[locale]],
    [locale === "ar" ? "الأنشطة المسجلة" : "Registered activities", String(totalRegisteredActivities)],
    [locale === "ar" ? "العنوان الوطني" : "National address", c.address.shortCode],
  ];

  return (
    <>
      <PageHero eyebrow={t.about.eyebrow} title={t.about.title} lead={t.about.lead} />

      {/* Statutory identity — the first thing a government reviewer looks for */}
      <section className="section" data-surface-section="light">
        <div className="page about-identity">
          <div className="about-identity-head">
            <p className="eyebrow" data-reveal="up">
              {t.about.identityTitle}
            </p>
            <MaskLines as="h2" className="section-title" lines={[t.about.identityTitle]} />
          </div>
          <dl className="identity-list" data-reveal-group="">
            {identity.map(([k, v]) => (
              <div key={k} className="identity-row" data-reveal="up">
                <dt>{k}</dt>
                <dd className="tabular">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* How we work */}
      <section className="section" data-surface="paper-deep" data-surface-section="light">
        <div className="page">
          <div className="section-head">
            <p className="eyebrow" data-reveal="up">
              {t.about.approachTitle}
            </p>
            <MaskLines as="h2" className="section-title" lines={[t.about.approachTitle]} />
          </div>
          <div className="approach-grid" data-reveal-group="">
            {t.about.approachItems.map((item, i) => (
              <article key={item.title} className="approach-card card" data-reveal="up">
                <span className="tabular approach-index">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="approach-title">{item.title}</h3>
                <p className="approach-body">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Documented operating regions */}
      <section className="section" data-surface="ink" data-surface-section="ink">
        <div className="page coverage">
          <div className="coverage-copy">
            <p className="eyebrow" data-reveal="up">
              {t.about.coverageTitle}
            </p>
            <MaskLines as="h2" className="section-title" lines={[t.about.coverageTitle]} />
            <p className="section-lead" data-reveal="up">
              {t.about.coverageLead}
            </p>
            <ul className="coverage-list" data-reveal-group="">
              {regions.map((r, i) => (
                <li key={r} data-reveal="up">
                  <span className="tabular">{String(i + 1).padStart(2, "0")}</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>
          <div className="coverage-figure" data-parallax-scope="">
            <span className="figure">
              <span data-parallax="-35">
                <Image
                  src={projects[1]?.cover.src ?? projects[0].cover.src}
                  alt={projects[1]?.cover.alt[locale] ?? projects[0].cover.alt[locale]}
                  width={projects[1]?.cover.w ?? projects[0].cover.w}
                  height={projects[1]?.cover.h ?? projects[0].cover.h}
                  sizes="(max-width: 900px) 92vw, 46vw"
                  placeholder="blur"
                  blurDataURL={projects[1]?.cover.blur ?? projects[0].cover.blur}
                />
              </span>
            </span>
          </div>
        </div>
      </section>

      {/* Company profile */}
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
