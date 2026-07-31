import Image from "next/image";
import Link from "next/link";
import { getDictionary } from "@/i18n/dictionaries";
import { href, type Locale } from "@/i18n/config";
import { company } from "@/content/company";
import HeroScene from "./HeroScene";
import { MarkGeometry, MarkOutline, MARK_BOX } from "@/components/brand/MarkGeometry";
import Magnetic from "@/components/motion/Magnetic";

/**
 * The mark, set out and then issued.
 *
 * Stage one is the mark's own envelope — its exact silhouette, drawn as pure
 * line with the Kufic lettering not yet in it, inside a construction frame.
 * Stage two is the mark as issued: every letterform, at full fidelity, the
 * teal counters in place.
 *
 * Scrolling fills the lettering into the outline, so the page's promise —
 * «من المخطط إلى الإنجاز» — happens in the artwork rather than beside it.
 * The silhouette is the real one throughout; nothing is approximated.
 */
function ElevationDrawing() {
  const { x0, y0, x1, y1 } = MARK_BOX;
  const cx = (x0 + x1) / 2;

  return (
    <svg
      viewBox="0 0 620 900"
      fill="none"
      aria-hidden="true"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Stage one — the envelope in its construction frame */}
      <g data-sketch="">
        <g stroke="currentColor" strokeWidth="0.9" vectorEffect="non-scaling-stroke" opacity="0.3">
          <path d={`M${x0} ${y0} L${x1} ${y0} L${x1} ${y1} L${x0} ${y1} Z`} />
          <path d={`M${cx} ${y0 - 34} L${cx} ${y1 + 34}`} />
          <path d={`M${x0} ${y0 + (y1 - y0) / 3} L${x1} ${y0 + (y1 - y0) / 3}`} />
          <path d={`M${x0} ${y0 + ((y1 - y0) * 2) / 3} L${x1} ${y0 + ((y1 - y0) * 2) / 3}`} />
          <path d={`M${x0 - 40} ${y1 + 38} L${x1 + 40} ${y1 + 38}`} />
          <path d={`M${x0} ${y1 + 30} L${x0} ${y1 + 46}`} />
          <path d={`M${x1} ${y1 + 30} L${x1} ${y1 + 46}`} />
        </g>
        <MarkOutline stroke="currentColor" />
      </g>

      {/* Stage two — the mark as issued */}
      <g data-mark="">
        <MarkGeometry stroke="currentColor" accentStroke="var(--color-teal-300)" />
      </g>
    </svg>
  );
}

export default function Hero({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const lines = t.home.heroTitleLines;

  const facts = [
    { k: locale === "ar" ? "السجل التجاري" : "Commercial register", v: company.commercialRegistration },
    { k: locale === "ar" ? "أنظمة معتمدة" : "Certified systems", v: "ISO 9001 · 14001 · 45001" },
    { k: locale === "ar" ? "المقر" : "Head office", v: locale === "ar" ? "الرياض — الملز" : "Riyadh — Al Malaz" },
  ];

  return (
    <HeroScene introKey="imran-hero-intro">
      {/* Opening veil — carries the mark for the first beat, then lifts. */}
      <div
        data-hero-veil=""
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-50 grid place-items-center bg-[var(--color-ink)]"
      >
        <Image
          data-hero-mark=""
          src="/brand/mark.png"
          alt=""
          width={900}
          height={1070}
          priority
          className="h-[clamp(190px,34vh,420px)] w-auto opacity-0"
        />
      </div>

      <div className="hero-layers" aria-hidden="true">
        <div data-hero-glow="" className="hero-glow" />
        <div data-hero-grid="" data-depth="6" className="blueprint-grid hero-grid" />
        <div data-hero-drawing="" data-depth="16" className="hero-drawing">
          <ElevationDrawing />
        </div>
      </div>

      <div className="page hero-inner">
        <div data-hero-copy="" className="hero-copy">
          {/* The opening formula, set at the head of the page as it is set at
              the head of a written work. */}
          <p data-hero-fade="" className="basmala" lang="ar" dir="rtl">
            {t.home.basmala}
          </p>

          <p data-hero-fade="" className="eyebrow">
            {t.home.heroEyebrow}
          </p>

          <h1 className="hero-title">
            {lines.map((line, i) => (
              <span key={i} data-hero-line="" className="block overflow-hidden">
                <span className="block">{line}</span>
              </span>
            ))}
            <span data-hero-line="" className="block overflow-hidden">
              <span className="hero-title-accent block">{t.home.heroSubtitle}</span>
            </span>
          </h1>

          <div data-hero-rule="" className="hero-rule" />

          <p data-hero-fade="" className="hero-lead">
            {t.home.heroLead}
          </p>

          <div data-hero-fade="" className="hero-actions">
            <Magnetic>
              <Link href={href("/quote", locale)} className="btn">
                {t.common.requestQuote}
                <span className="arrow" aria-hidden="true">
                  {locale === "ar" ? "←" : "→"}
                </span>
              </Link>
            </Magnetic>
            <Magnetic>
              <Link href={href("/projects", locale)} className="btn btn-ghost">
                {t.common.viewAllProjects}
              </Link>
            </Magnetic>
          </div>
        </div>

        <div data-hero-meta="" className="hero-meta">
          <dl className="hero-facts">
            {facts.map((f) => (
              <div key={f.k} className="hero-fact">
                <dt>{f.k}</dt>
                <dd className="tabular">{f.v}</dd>
              </div>
            ))}
          </dl>
          <a href="#intro" className="hero-scroll" aria-label={t.common.scrollHint}>
            <span>{t.common.scrollHint}</span>
            <span className="hero-scroll-track" aria-hidden="true">
              <span className="hero-scroll-thumb" />
            </span>
          </a>
        </div>
      </div>
    </HeroScene>
  );
}
