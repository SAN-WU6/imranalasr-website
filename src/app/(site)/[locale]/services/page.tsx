import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageHero from "@/components/PageHero";
import { MaskLines } from "@/components/MaskLines";
import { getDictionary } from "@/i18n/dictionaries";
import { href, isLocale, locales, type Locale } from "@/i18n/config";
import { pageMetadata } from "@/lib/seo";
import { resolveProjects, resolveServices } from "@/lib/content";
import { totalRegisteredActivities } from "@/content/services";

export const revalidate = 300;
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return pageMetadata({ locale, path: "/services", title: t.services.title, description: t.services.lead });
}

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const t = getDictionary(locale);
  const [services, projects] = await Promise.all([resolveServices(), resolveProjects()]);

  return (
    <>
      <PageHero
        eyebrow={t.services.eyebrow}
        title={t.services.title}
        lead={t.services.lead}
        aside={
          <p className="page-hero-stat tabular">
            <span>{totalRegisteredActivities}</span> {t.common.registeredActivities}
          </p>
        }
      />

      <section className="section" data-surface-section="light">
        <div className="page services-list">
          {services.map((s) => {
            const related = projects.filter((p) => p.relatedServices.includes(s.slug));
            return (
              <article key={s.slug} id={s.slug} className="service-block" data-reveal-group="">
                <header className="service-block-head">
                  <span className="tabular service-block-index" data-reveal="fade">
                    {s.index}
                  </span>
                  <MaskLines as="h2" className="service-block-title" lines={[s.title[locale]]} />
                  <p className="service-block-lead" data-reveal="up">
                    {s.lead[locale]}
                  </p>
                </header>

                <div className="service-block-body">
                  <div className="service-activities">
                    <h3 className="service-activities-title" data-reveal="up">
                      {t.services.activitiesTitle}
                    </h3>
                    <ul>
                      {s.activities.map((a) => (
                        <li key={a.code} data-reveal="up">
                          <span className="tabular activity-code">{a.code}</span>
                          <span className="activity-name">
                            {a[locale]}
                            {a.licenceNote ? (
                              <span className="activity-note">
                                <span className="activity-note-badge">{t.services.licenceLabel}</span>
                                {a.licenceNote[locale]}
                              </span>
                            ) : null}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {related.length ? (
                    <aside className="service-related" data-reveal="up">
                      <h3 className="service-related-title">{t.services.relatedProjects}</h3>
                      <ul>
                        {related.map((p) => (
                          <li key={p.slug}>
                            <Link href={href(`/projects/${p.slug}`, locale)} className="link-sweep">
                              {p.title[locale]}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </aside>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="section" data-surface="paper-deep" data-surface-section="light">
        <div className="page note-block card" data-reveal="up">
          <h2 className="note-title">{t.services.noteTitle}</h2>
          <p className="note-body">{t.services.noteBody}</p>
          <Link href={href("/quote", locale)} className="btn btn-ghost">
            {t.common.requestQuote}
          </Link>
        </div>
      </section>
    </>
  );
}
