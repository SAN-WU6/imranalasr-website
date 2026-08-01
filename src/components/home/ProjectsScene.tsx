"use client";

import { useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ProjectLink from "@/components/ProjectLink";
import { href, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Project, ShowcaseTile } from "@/content/projects";

/**
 * The projects sequence — the spine of the whole page.
 *
 * The composition is a true geometric spiral: thirty photographs are set out
 * on an Archimedean arm, r = r0 + k·θ, at a constant angular step, so the
 * frames step outward at an even rate and the eye is carried around the
 * centre rather than scattered at random. Each frame is scaled by its radius,
 * so the arm also reads as depth.
 *
 * Scrolling drives three beats:
 *   1. the arm UNWINDS — every frame flies in along the spiral from further
 *      round the curve, so the whole set coils inward together;
 *   2. it BREATHES — depth bands separate at different rates;
 *   3. it COLLAPSES — the frames spin back into the centre and the ordered,
 *      clickable project index rises through them.
 *
 * The scattered layer is decorative and hidden from assistive technology; the
 * index below it is the real, always-present content.
 */

/** How many photographs from each project join the spiral. */
const PER_PROJECT = 6;

type Slot = {
  /** centre position, % of stage */
  x: number;
  y: number;
  /** width, % of stage */
  w: number;
  rot: number;
  /** 1 = innermost band … 4 = outermost */
  depth: number;
  /** polar coordinates, kept so the entry can travel along the arm */
  theta: number;
  r: number;
};

/**
 * Archimedean spiral, stretched horizontally to suit a wide stage.
 * A constant angular step keeps the arm legible; the radius grows on a gentle
 * curve so the inner turns stay tight and the outer ones open up.
 */
const STEP = 0.435; // radians between frames — ~2 full turns across 30 frames
const START = -2.1;
/** Slightly flattened: the arm has to sit above the project index. */
const SX = 1.3;
const SY = 0.84;
const CY = 38;

/** Polar → stage percentage, used by both the resting arm and its entry path. */
function place(theta: number, r: number) {
  return { x: 50 + r * Math.cos(theta) * SX, y: CY + r * Math.sin(theta) * SY };
}

function spiral(count: number): Slot[] {
  return Array.from({ length: count }, (_, i) => {
    const t = i / Math.max(1, count - 1);
    const theta = START + i * STEP;
    const r = 9 + 31 * Math.pow(t, 0.82);
    const { x, y } = place(theta, r);
    return {
      x,
      y,
      w: 5.2 + 8.4 * t,
      rot: Math.sin(theta) * 7 - 2,
      depth: 1 + Math.min(3, Math.floor(t * 4)),
      theta,
      r,
    };
  });
}

export default function ProjectsScene({
  locale,
  t,
  projects,
  showcase,
}: {
  locale: Locale;
  t: Dictionary;
  projects: Project[];
  /** Chosen in the dashboard; null means compose the scene automatically. */
  showcase?: ShowcaseTile[] | null;
}) {
  const root = useRef<HTMLElement>(null);

  /**
   * Interleave the projects so neighbouring frames on the arm come from
   * different sites — the composition reads as one body of work, and every
   * photograph still sits under the project it belongs to.
   */
  const tiles = useMemo(() => {
    if (showcase?.length) {
      // A curated selection arrives already interleaved and already checked
      // against the published galleries.
      return showcase.flatMap((tile) => {
        const project = projects.find((p) => p.slug === tile.slug);
        return project ? [{ img: { src: tile.src, w: tile.w, h: tile.h, blur: tile.blur }, project }] : [];
      });
    }
    const picks = projects.map((p) => {
      const g = p.gallery.length ? p.gallery : [p.cover];
      const step = Math.max(1, Math.floor(g.length / PER_PROJECT));
      return Array.from({ length: PER_PROJECT }, (_, k) => g[Math.min(g.length - 1, k * step)]);
    });
    const out: { img: { src: string; w: number; h: number; blur: string }; project: Project }[] = [];
    for (let k = 0; k < PER_PROJECT; k++) {
      projects.forEach((p, pi) => out.push({ img: picks[pi][k], project: p }));
    }
    return out;
  }, [projects, showcase]);

  const slots = useMemo(() => spiral(tiles.length), [tiles.length]);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (document.documentElement.classList.contains("reduced-motion")) {
      el.dataset.static = "true";
      return;
    }
    if (window.matchMedia("(max-width: 767px)").matches) {
      el.dataset.static = "true";
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const stage = el.querySelector<HTMLElement>("[data-stage]")!;
      const frames = gsap.utils.toArray<HTMLElement>("[data-tile]");
      const cards = gsap.utils.toArray<HTMLElement>("[data-project-card]");

      gsap.set(cards, { opacity: 0, yPercent: 12 });

      /** Where a frame starts: further round the same arm, further out. */
      const entry = (i: number) => {
        const s = slots[i];
        const from = place(s.theta + 1.6, s.r * 2.6 + 30);
        return { dx: (from.x - s.x) / 100, dy: (from.y - s.y) / 100 };
      };

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "+=470%",
          scrub: 0.8,
          pin: "[data-stage]",
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      /* 1 — the arm unwinds: each frame travels in along the spiral */
      frames.forEach((frame, i) => {
        const s = slots[i];
        tl.fromTo(
          frame,
          {
            x: () => entry(i).dx * stage.offsetWidth,
            y: () => entry(i).dy * stage.offsetHeight,
            rotate: s.rot + 34,
            scale: 0.42,
            opacity: 0,
          },
          {
            x: 0,
            y: 0,
            rotate: s.rot,
            scale: 1,
            opacity: 1,
            ease: "power2.out",
            duration: 1.15,
          },
          i * 0.035
        );
      });

      /* 2 — the arm breathes: depth bands drift apart */
      frames.forEach((frame, i) => {
        tl.to(frame, { y: `-=${slots[i].depth * 14}`, ease: "none", duration: 1.5 }, 1.4);
      });

      /* 3 — the label under the pinned title changes with the scene */
      tl.to("[data-scene-label='compose']", { opacity: 0, y: -12, duration: 0.3 }, 2.5)
        .fromTo("[data-scene-label='index']", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.4 }, 2.7);

      /* 4 — the spiral winds back into the centre, the index rises through it */
      frames.forEach((frame, i) => {
        const s = slots[i];
        tl.to(
          frame,
          {
            x: () => -((s.x - 50) / 100) * stage.offsetWidth * 0.72,
            y: () => -((s.y - CY) / 100) * stage.offsetHeight * 0.72,
            rotate: s.rot - 46,
            scale: 0.3,
            opacity: 0,
            filter: "blur(7px)",
            ease: "power2.in",
            duration: 0.95,
          },
          2.5 + (frames.length - i) * 0.014
        );
      });

      /* The index only rises once the arm has wound itself out of the way. */
      tl.to(cards, { opacity: 1, yPercent: 0, ease: "expo.out", duration: 1, stagger: 0.09 }, 3.35);

      /* progress rail */
      tl.fromTo("[data-scene-rail]", { scaleX: 0 }, { scaleX: 1, ease: "none", duration: tl.duration() }, 0);
    }, el);

    return () => ctx.revert();
  }, [slots, tiles.length]);

  return (
    <section
      ref={root}
      className="projects-scene"
      data-surface="ink"
      data-surface-section="ink"
      aria-labelledby="projects-scene-title"
    >
      <div data-stage="" className="ps-stage">
        <div className="ps-scatter" aria-hidden="true">
          {tiles.map((tile, i) => {
            const s = slots[i];
            return (
              /* The anchor owns the centring translate; GSAP owns the frame's
                 transform. Keeping them on separate elements matters: GSAP
                 normalises the `translate` property to `none` on anything it
                 animates, which would silently drop the offset. */
              <span
                key={`${tile.project.slug}-${i}`}
                className="ps-anchor"
                style={{ insetInlineStart: `${s.x}%`, top: `${s.y}%`, width: `${s.w}%`, zIndex: s.depth }}
              >
                <figure data-tile="" data-depth={s.depth} className="ps-tile" style={{ opacity: 0 }}>
                  <Image
                    src={tile.img.src}
                    alt=""
                    width={tile.img.w}
                    height={tile.img.h}
                    sizes="22vw"
                    placeholder="blur"
                    blurDataURL={tile.img.blur}
                    className="ps-tile-img"
                  />
                  <figcaption className="ps-tile-cap tabular">{tile.project.location[locale]}</figcaption>
                </figure>
              </span>
            );
          })}
        </div>

        <div className="page ps-head">
          <p className="eyebrow">{t.home.projectsEyebrow}</p>
          <h2 id="projects-scene-title" className="ps-title">
            {t.home.projectsTitle}
          </h2>
          <div className="ps-labels">
            <span data-scene-label="compose">{t.home.projectsLead}</span>
            <span data-scene-label="index" className="ps-label-index">
              {t.home.projectsIndexLabel} · <span className="tabular">{projects.length}</span>
            </span>
          </div>
          <span className="ps-rail" aria-hidden="true">
            <span data-scene-rail="" className="ps-rail-fill" />
          </span>
        </div>

        <div className="page ps-grid" data-project-grid="">
          {projects.map((p, i) => (
            <article key={p.slug} data-project-card="" className="ps-card">
              <ProjectLink href={href(`/projects/${p.slug}`, locale)} className="ps-card-link">
                <span className="figure figure-zoom ps-card-figure">
                  <Image
                    src={p.cover.src}
                    alt={p.cover.alt[locale]}
                    width={p.cover.w}
                    height={p.cover.h}
                    sizes="(max-width: 767px) 92vw, (max-width: 1200px) 46vw, 30vw"
                    placeholder="blur"
                    blurDataURL={p.cover.blur}
                    style={{ viewTransitionName: `project-${p.slug}` }}
                  />
                </span>
                <span className="ps-card-meta">
                  <span className="tabular ps-card-index">{String(i + 1).padStart(2, "0")}</span>
                  <span className="ps-card-loc tabular">{p.location[locale]}</span>
                </span>
                <h3 className="ps-card-title">{p.title[locale]}</h3>
                <span className="ps-card-cta">
                  {t.common.viewProject}
                  <span aria-hidden="true">{locale === "ar" ? "←" : "→"}</span>
                </span>
              </ProjectLink>
            </article>
          ))}
        </div>

        <div className="page ps-foot">
          <Link href={href("/projects", locale)} className="btn btn-ghost">
            {t.common.viewAllProjects}
          </Link>
          {/* What is shown is a selection; the rest lives in the profile. */}
          <p className="ps-more">
            {t.home.projectsMore}{" "}
            <Link href={href("/profile-request", locale)} className="link-sweep ps-more-cta">
              {t.home.projectsMoreCta}
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
