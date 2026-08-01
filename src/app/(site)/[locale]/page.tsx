import type { CSSProperties } from "react";
import Link from "next/link";
import Image from "next/image";
import Hero from "@/components/home/Hero";
import ServicesScene from "@/components/home/ServicesScene";
import ProjectsScene from "@/components/home/ProjectsScene";
import VerseBand from "@/components/home/VerseBand";
import CredentialCard from "@/components/CredentialCard";
import { MaskLines } from "@/components/MaskLines";
import Magnetic from "@/components/motion/Magnetic";
import { getDictionary } from "@/i18n/dictionaries";
import { href, isLocale, type Locale } from "@/i18n/config";
import { resolveCredentials, resolveHome, resolveProjects, resolveServices } from "@/lib/content";
import { totalRegisteredActivities } from "@/content/services";
import { notFound } from "next/navigation";

export const revalidate = 300;

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const t = getDictionary(locale);

  const [projects, services, credentials] = await Promise.all([
    resolveProjects(),
    resolveServices(),
    resolveCredentials(),
  ]);

  const regions = Array.from(new Set(projects.map((p) => p.location[locale])));

  // The opening photograph, the documented figures and the projects scene are
  // all editable from the dashboard; each falls back to the delivered content.
  const home = await resolveHome(projects);
  const figureProject = home.figure?.project ?? projects[0];
  const figure = home.figure?.image ?? figureProject?.coverPortrait;

  const counted: Record<string, number> = {
    activities: totalRegisteredActivities,
    isoSystems: 3,
    projects: projects.length,
    regions: regions.length,
  };
  const stats = home.stats.items
    .filter((item) => item.published)
    .map((item) => ({
      key: item.key,
      n: item.value ?? counted[item.key],
      label: item.label?.[locale]?.trim() || t.home.stats[item.key],
    }));
  const statsLabel = home.stats.label?.[locale]?.trim() || t.home.statsLabel;

  return (
    <>
      <Hero locale={locale} />

      {/* ── Intro: the hero's grid resolves into a stated position ─────── */}
      <section id="intro" className="section intro-section" data-surface-section="light">
        <div className="page intro-grid">
          <div className="intro-copy">
            <p className="eyebrow" data-reveal="up">
              {t.home.introEyebrow}
            </p>
            <MaskLines
              as="h2"
              className="section-title intro-title"
              lines={t.home.introTitle.split(" ").length > 4 ? [t.home.introTitle] : [t.home.introTitle]}
            />
            <p className="intro-body" data-reveal="up">
              {t.home.introBody}
            </p>
            <div data-reveal="up">
              <Magnetic>
                <Link href={href("/about", locale)} className="btn btn-ghost">
                  {t.nav.about}
                  <span className="arrow" aria-hidden="true">
                    {locale === "ar" ? "←" : "→"}
                  </span>
                </Link>
              </Magnetic>
            </div>
          </div>

          <div className="intro-figure" data-parallax-scope="">
            <span className="figure intro-figure-frame">
              <span
                data-parallax="-40"
                className="intro-figure-inner"
                style={{ "--figure-pos": home.figure?.position ?? "50% 50%" } as CSSProperties}
              >
                <Image
                  src={figure.src}
                  alt={figure.alt[locale]}
                  width={figure.w}
                  height={figure.h}
                  priority
                  sizes="(max-width: 900px) 90vw, 38vw"
                  placeholder="blur"
                  blurDataURL={figure.blur}
                />
              </span>
            </span>
            <p className="intro-figure-cap tabular">
              {figureProject.title[locale]} · {figureProject.location[locale]}
            </p>
          </div>
        </div>

        {/* Hiding every figure in the dashboard removes the strip rather than
            leaving an empty rule across the page. */}
        {stats.length > 0 && (
          <div className="page stats-strip" data-reveal-group="">
            <p className="stats-label eyebrow" data-reveal="up">
              {statsLabel}
            </p>
            <dl className="stats-row">
              {stats.map((s) => (
                <div key={s.key} className="stat" data-reveal="up">
                  <dt className="tabular stat-n">
                    <span data-count={s.n}>0</span>
                  </dt>
                  <dd className="stat-label">{s.label}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </section>

      <VerseBand locale={locale} />

      <ServicesScene locale={locale} t={t} services={services} />

      <ProjectsScene locale={locale} t={t} projects={projects} showcase={home.showcase} />

      {/* ── Credentials ────────────────────────────────────────────────── */}
      <section className="section quality-strip" data-surface="paper-deep" data-surface-section="light">
        <div className="page">
          <div className="section-head">
            <p className="eyebrow" data-reveal="up">
              {t.home.qualityEyebrow}
            </p>
            <MaskLines as="h2" className="section-title" lines={[t.home.qualityTitle]} />
            <p className="section-lead" data-reveal="up">
              {t.home.qualityLead}
            </p>
          </div>
          <div className="cred-grid" data-reveal-group="">
            {credentials.slice(0, 3).map((c) => (
              <CredentialCard key={c.id} credential={c} locale={locale} t={t} />
            ))}
          </div>
          <div className="section-foot" data-reveal="up">
            <Link href={href("/quality", locale)} className="btn btn-ghost">
              {t.nav.quality}
              <span className="arrow" aria-hidden="true">
                {locale === "ar" ? "←" : "→"}
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Closing call ───────────────────────────────────────────────── */}
      <section className="section cta-section" data-surface="teal" data-surface-section="teal">
        <div className="blueprint-grid cta-grid" aria-hidden="true" />
        <div className="page cta-inner">
          <MaskLines as="h2" className="cta-title" lines={[t.home.ctaTitle]} />
          <p className="cta-lead" data-reveal="up">
            {t.home.ctaLead}
          </p>
          <div className="cta-actions" data-reveal="up">
            <Magnetic>
              <Link href={href("/quote", locale)} className="btn">
                {t.common.requestQuote}
                <span className="arrow" aria-hidden="true">
                  {locale === "ar" ? "←" : "→"}
                </span>
              </Link>
            </Magnetic>
            <Magnetic>
              <Link href={href("/contact", locale)} className="btn btn-ghost">
                {t.common.getInTouch}
              </Link>
            </Magnetic>
          </div>
        </div>
      </section>
    </>
  );
}
