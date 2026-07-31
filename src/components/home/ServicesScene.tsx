"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ServiceDiagram from "./ServiceDiagram";
import { href, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Service } from "@/content/services";

/**
 * Services as a sticky narrative rather than six identical cards.
 *
 * The reader scrolls through six chapters; the panel beside them holds still
 * and rewrites itself — diagram, index, registered activity codes. Because
 * every group is anchored to real activity numbers, the panel doubles as a
 * verifiable reference, which is exactly what a government reviewer wants.
 */
export default function ServicesScene({
  locale,
  t,
  services,
}: {
  locale: Locale;
  t: Dictionary;
  services: Service[];
}) {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-step]").forEach((step, i) => {
        ScrollTrigger.create({
          trigger: step,
          start: "top 62%",
          end: "bottom 62%",
          onEnter: () => setActive(i),
          onEnterBack: () => setActive(i),
        });
      });
    }, el);

    return () => ctx.revert();
  }, [services.length]);

  const current = services[active] ?? services[0];

  return (
    <section ref={root} className="services-scene section" data-surface-section="light" aria-labelledby="services-scene-title">
      <div className="page services-scene-head">
        <p className="eyebrow" data-reveal="up">
          {t.home.servicesEyebrow}
        </p>
        <h2 id="services-scene-title" className="section-title" data-reveal="up">
          {t.home.servicesTitle}
        </h2>
        <p className="section-lead" data-reveal="up">
          {t.home.servicesLead}
        </p>
      </div>

      <div className="page services-scene-body">
        <div className="svc-steps">
          {services.map((s, i) => (
            <article key={s.slug} data-step="" className="svc-step" data-active={i === active}>
              <span className="tabular svc-step-index">{s.index}</span>
              <h3 className="svc-step-title">{s.title[locale]}</h3>
              <p className="svc-step-lead">{s.lead[locale]}</p>
              <ul className="svc-step-activities">
                {s.activities.map((a) => (
                  <li key={a.code}>
                    <span className="tabular svc-code">{a.code}</span>
                    <span>{a[locale]}</span>
                  </li>
                ))}
              </ul>
              <Link href={href(`/services#${s.slug}`, locale)} className="btn btn-quiet svc-step-link">
                {t.common.readMore}
                <span className="arrow" aria-hidden="true">
                  {locale === "ar" ? "←" : "→"}
                </span>
              </Link>
            </article>
          ))}
        </div>

        <aside className="svc-panel" aria-hidden="true">
          <div className="svc-panel-inner">
            <div className="svc-panel-figure">
              <ServiceDiagram slug={current.slug} />
              <span className="svc-panel-grid" />
            </div>
            <div className="svc-panel-meta">
              <span className="tabular svc-panel-index">{current.index}</span>
              <p className="svc-panel-title">{current.title[locale]}</p>
              <p className="svc-panel-count tabular">
                {current.activities.length} {t.common.registeredActivities}
              </p>
            </div>
            <ol className="svc-panel-ticks">
              {services.map((s, i) => (
                <li key={s.slug} data-on={i <= active} />
              ))}
            </ol>
          </div>
        </aside>
      </div>

      <div className="page services-scene-foot">
        <Link href={href("/services", locale)} className="btn btn-ghost" data-reveal="up">
          {t.common.allServices}
        </Link>
      </div>
    </section>
  );
}
