"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Light magnetic pull for primary calls to action. Capped at a few pixels so
 * the control never wanders away from where the pointer expects to click.
 */
export default function Magnetic({ children, strength = 0.24, className }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let cx = 0, cy = 0, tx = 0, ty = 0;

    const loop = () => {
      cx += (tx - cx) * 0.16;
      cy += (ty - cy) * 0.16;
      el.style.transform = `translate3d(${cx.toFixed(2)}px, ${cy.toFixed(2)}px, 0)`;
      raf = requestAnimationFrame(loop);
    };

    const enter = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const max = 14;
      tx = Math.max(-max, Math.min(max, dx * strength));
      ty = Math.max(-max, Math.min(max, dy * strength));
    };
    const leave = () => {
      tx = 0;
      ty = 0;
      window.setTimeout(() => {
        if (Math.abs(cx) < 0.2 && Math.abs(cy) < 0.2) {
          cancelAnimationFrame(raf);
          raf = 0;
          el.style.transform = "";
        }
      }, 600);
    };

    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [strength]);

  return (
    <span ref={ref} className={className} style={{ display: "inline-flex", willChange: "transform" }}>
      {children}
    </span>
  );
}
