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
import { resolveCredentials, resolveProjects, resolveServices } from "@/lib/content";
import { totalRegisteredActivities } from "@/content/services";
import { openingFigure } from "@/content/projects";
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

  // The opening photograph is chosen by name, so it survives reordering. If the
  // admin panel ever unpublishes that project, fall back to the first one's
  // portrait rather than rendering an empty frame.
  const figureProject = projects.find((p) => p.slug === openingFigure.slug) ?? projects[0];
  const figure = figureProject?.gallery[openingFigure.galleryIndex] ?? figureProject?.coverPortrait;

  const stats = [
    { n: totalRegisteredActivities, label: t.home.stats.activities },
    { n: 3, label: t.home.stats.isoSystems },
    { n: projects.length, label: t.home.stats.projects },
    { n: regions.length, label: t.home.stats.regions },
  ];

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
                style={{ "--figure-pos": openingFigure.position } as CSSProperties}
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

        <div className="page stats-strip" data-reveal-group="">
          <p className="stats-label eyebrow" data-reveal="up">
            {t.home.statsLabel}
          </p>
          <dl className="stats-row">
            {stats.map((s) => (
              <div key={s.label} className="stat" data-reveal="up">
                <dt className="tabular stat-n">
                  <span data-count={s.n}>0</span>
                </dt>
                <dd className="stat-label">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <VerseBand locale={locale} />

      <ServicesScene locale={locale} t={t} services={services} />

      <ProjectsScene locale={locale} t={t} projects={projects} />

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
