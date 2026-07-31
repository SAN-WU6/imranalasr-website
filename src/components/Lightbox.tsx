"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import type { ProjectImage } from "@/content/projects";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

/**
 * Full-frame viewer. Keyboard first: arrows move, Escape closes, focus is
 * trapped to the dialog, and the picture is never cropped or distorted.
 */
export default function Lightbox({
  images,
  locale,
  t,
  index,
  onClose,
  onIndexChange,
}: {
  images: ProjectImage[];
  locale: Locale;
  t: Dictionary;
  index: number | null;
  onClose: () => void;
  onIndexChange: (i: number) => void;
}) {
  const open = index !== null;
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const step = useCallback(
    (delta: number) => {
      if (index === null) return;
      onIndexChange((index + delta + images.length) % images.length);
    },
    [index, images.length, onIndexChange]
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") step(locale === "ar" ? -1 : 1);
      if (e.key === "ArrowLeft") step(locale === "ar" ? 1 : -1);
      if (e.key === "Tab") e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    document.documentElement.classList.add("lenis-stopped");
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      document.documentElement.classList.remove("lenis-stopped");
    };
  }, [open, onClose, step, locale]);

  if (!mounted || index === null) return null;
  const img = images[index];

  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={t.common.gallery} data-surface="ink">
      <button type="button" className="lightbox-backdrop" onClick={onClose} tabIndex={-1} aria-hidden="true" />
      <div className="lightbox-shell">
        <div className="lightbox-bar">
          <p className="tabular lightbox-counter">
            {t.common.image} {index + 1} {t.common.of} {images.length}
          </p>
          <button type="button" className="lightbox-close" onClick={onClose} autoFocus>
            <span className="sr-only">{t.nav.close}</span>
            <span aria-hidden="true">✕</span>
          </button>
        </div>

        <figure className="lightbox-figure">
          <Image
            key={img.src}
            src={img.src}
            alt={img.alt[locale]}
            width={img.w}
            height={img.h}
            sizes="92vw"
            placeholder="blur"
            blurDataURL={img.blur}
            className="lightbox-img"
          />
          <figcaption className="lightbox-caption">{img.alt[locale]}</figcaption>
        </figure>

        <div className="lightbox-nav">
          <button type="button" onClick={() => step(-1)} className="btn btn-ghost">
            <span aria-hidden="true">{locale === "ar" ? "→" : "←"}</span> {t.common.previous}
          </button>
          <button type="button" onClick={() => step(1)} className="btn btn-ghost">
            {t.common.next} <span aria-hidden="true">{locale === "ar" ? "←" : "→"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
