"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Hero choreography.
 *
 * Three things happen here and they are deliberately different from one
 * another — motion should carry meaning, not repeat itself:
 *
 *  1. ENTRANCE — the logo geometry draws itself the way a setting-out drawing
 *     is drawn: outline first, then the internal grid, then the type arrives
 *     through line masks. The full overture plays once per session.
 *  2. POINTER — background layers hold different depths and drift against each
 *     other by a few pixels. Damped, slow, never distracting.
 *  3. SCROLL — the scene is recomposed rather than pushed away: the grid
 *     expands past the frame, the drawing recedes, the headline separates, so
 *     the next section arrives *through* the hero instead of after it.
 *
 * The markup is rendered on the server and passed in as children, so the
 * headline exists in the HTML with or without JavaScript.
 */
export default function HeroScene({ children, introKey }: { children: ReactNode; introKey: string }) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    el.dataset.ready = "true";
    if (document.documentElement.classList.contains("reduced-motion")) {
      // No transformation to watch: show the finished mark outright.
      el.querySelector<HTMLElement>("[data-sketch]")?.style.setProperty("opacity", "0");
      el.querySelector<HTMLElement>("[data-mark]")?.style.setProperty("opacity", "1");
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    const seen = sessionStorage.getItem(introKey) === "1";
    let onMove: ((e: PointerEvent) => void) | null = null;

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(el);

      /* ── 1. Entrance ───────────────────────────────────────────────── */
      const lengthOf = (el: Element) => {
        const geo = el as unknown as SVGGeometryElement;
        return typeof geo.getTotalLength === "function" ? geo.getTotalLength() : 900;
      };

      /* The schematic draws itself on arrival … */
      const strokes = q("[data-sketch] path");
      strokes.forEach((s) => {
        const len = lengthOf(s);
        gsap.set(s, { strokeDasharray: len, strokeDashoffset: len });
      });

      /* … while the mark waits, undrawn, directly beneath it. */
      const markStrokes = q("[data-mark] path");
      markStrokes.forEach((s) => {
        const len = lengthOf(s);
        gsap.set(s, { strokeDasharray: len, strokeDashoffset: len });
      });
      gsap.set("[data-mark]", { opacity: 0 });

      const tl = gsap.timeline({ delay: seen ? 0.05 : 0.2 });

      if (!seen) {
        tl.to("[data-hero-veil]", { opacity: 0, duration: 1, ease: "power2.inOut" }, 0.55).fromTo(
          "[data-hero-mark]",
          { opacity: 0, scale: 1.22, filter: "blur(8px)" },
          { opacity: 1, scale: 1, filter: "blur(0px)", duration: 1.25, ease: "expo.out" },
          0
        );
        sessionStorage.setItem(introKey, "1");
      } else {
        gsap.set("[data-hero-veil]", { opacity: 0, pointerEvents: "none" });
        gsap.set("[data-hero-mark]", { opacity: 1, scale: 1, filter: "none" });
      }

      const base = seen ? 0 : 0.5;
      tl.to(strokes, { strokeDashoffset: 0, duration: 1.8, ease: "power2.inOut", stagger: 0.05 }, base)
        .fromTo("[data-hero-glow]", { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 2, ease: "expo.out" }, base)
        .fromTo("[data-hero-grid]", { opacity: 0 }, { opacity: 1, duration: 1.4, ease: "power2.out" }, base)
        .to("[data-hero-line] > span", { y: "0%", duration: 1.25, ease: "expo.out", stagger: 0.1 }, base + 0.35)
        .fromTo(
          "[data-hero-rule]",
          { scaleX: 0 },
          { scaleX: 1, duration: 1.1, ease: "expo.out", transformOrigin: "inline-start center" },
          base + 0.75
        )
        .fromTo(
          "[data-hero-fade]",
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.95, ease: "expo.out", stagger: 0.09 },
          base + 0.8
        );

      /* ── 2. Pointer depth ──────────────────────────────────────────── */
      if (window.matchMedia("(pointer: fine)").matches) {
        const setters = (q("[data-depth]") as HTMLElement[]).map((l) => ({
          depth: Number(l.dataset.depth ?? 10),
          x: gsap.quickTo(l, "xPercent", { duration: 1.2, ease: "power3.out" }),
          y: gsap.quickTo(l, "yPercent", { duration: 1.2, ease: "power3.out" }),
        }));
        onMove = (e: PointerEvent) => {
          const nx = (e.clientX / window.innerWidth - 0.5) * 2;
          const ny = (e.clientY / window.innerHeight - 0.5) * 2;
          for (const s of setters) {
            s.x(nx * s.depth * 0.11);
            s.y(ny * s.depth * 0.11);
          }
        };
        window.addEventListener("pointermove", onMove, { passive: true });
      }

      /* ── 3. Scroll: the drawing resolves into the mark, then recedes ── */
      const scroll = gsap.timeline({
        scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: 0.7 },
      });

      /* The schematic dissolves outward … */
      scroll
        .to("[data-sketch]", { opacity: 0, scale: 1.05, filter: "blur(3px)", ease: "power1.in", duration: 0.4 }, 0)
        /* … as the mark fades up and draws itself in, complete. */
        .to("[data-mark]", { opacity: 1, ease: "power1.out", duration: 0.28 }, 0.04)
        .to(
          markStrokes,
          { strokeDashoffset: 0, ease: "power2.out", duration: 0.42, stagger: { each: 0.012, from: "center" } },
          0.06
        );

      /* Only once it is whole does the whole frame recede. */
      scroll
        .to("[data-hero-grid]", { scale: 1.9, opacity: 0.1, ease: "none", duration: 1 }, 0)
        .to("[data-hero-drawing]", { yPercent: -16, opacity: 0.22, scale: 1.09, ease: "none", duration: 0.5 }, 0.5)
        .to("[data-hero-glow]", { opacity: 0, ease: "none", duration: 1 }, 0)
        .to("[data-hero-copy]", { yPercent: -24, opacity: 0, ease: "none", duration: 1 }, 0)
        .to("[data-hero-meta]", { yPercent: 70, opacity: 0, ease: "none", duration: 1 }, 0);
    }, el);

    return () => {
      if (onMove) window.removeEventListener("pointermove", onMove);
      ctx.revert();
    };
  }, [introKey]);

  return (
    <section ref={root} className="hero" data-surface="ink" data-surface-section="ink" aria-label="Imran Alasr Alhaditha">
      {children}
    </section>
  );
}
