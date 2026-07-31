"use client";

import { useEffect, useRef } from "react";

/**
 * A restrained cursor enhancement: a ring that trails the pointer and grows
 * over interactive targets. Fine pointers only, and it disappears entirely
 * under reduced motion (handled in CSS).
 */
export default function Cursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let tx = x;
    let ty = y;
    let raf = 0;

    const loop = () => {
      x += (tx - x) * 0.18;
      y += (ty - y) * 0.18;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const move = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      el.dataset.active = "true";
      const interactive = (e.target as HTMLElement)?.closest?.(
        'a, button, [role="button"], input, select, textarea, [data-cursor="link"]'
      );
      el.dataset.variant = interactive ? "link" : "default";
    };
    const leave = () => {
      el.dataset.active = "false";
    };

    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
    };
  }, []);

  return <div ref={ref} className="cursor-dot" aria-hidden="true" data-active="false" />;
}
