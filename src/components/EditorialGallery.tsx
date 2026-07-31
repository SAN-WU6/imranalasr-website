"use client";

import { useState } from "react";
import Image from "next/image";
import Lightbox from "./Lightbox";
import type { ProjectImage } from "@/content/projects";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

/**
 * An editorial gallery, not a grid of equal squares.
 *
 * Pictures are placed on a twelve-column rhythm in a repeating pattern of
 * wide / tall / paired frames, so the eye is given somewhere to rest and the
 * page reads like a printed project sheet. Depth is varied per frame so the
 * parallax is felt without any single image detaching from the flow.
 */

/** column span, row emphasis, parallax strength */
const PATTERN: { span: number; ratio: string; depth: number }[] = [
  { span: 8, ratio: "3 / 2", depth: 30 },
  { span: 4, ratio: "3 / 4", depth: -20 },
  { span: 5, ratio: "4 / 5", depth: 45 },
  { span: 7, ratio: "16 / 10", depth: -30 },
  { span: 12, ratio: "21 / 9", depth: 20 },
  { span: 6, ratio: "1 / 1", depth: -35 },
  { span: 6, ratio: "1 / 1", depth: 35 },
  { span: 7, ratio: "16 / 10", depth: -25 },
  { span: 5, ratio: "3 / 4", depth: 40 },
];

export default function EditorialGallery({
  images,
  locale,
  t,
}: {
  images: ProjectImage[];
  locale: Locale;
  t: Dictionary;
}) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <>
      <div className="gallery" data-parallax-scope="">
        {images.map((img, i) => {
          const p = PATTERN[i % PATTERN.length];
          return (
            <figure
              key={img.src}
              className="gallery-item"
              style={{ ["--span" as string]: p.span, ["--ratio" as string]: p.ratio }}
              data-reveal="scale"
            >
              <button
                type="button"
                className="figure figure-zoom gallery-btn"
                onClick={() => setOpen(i)}
                aria-label={`${t.common.image} ${i + 1} — ${img.alt[locale]}`}
              >
                <span data-parallax={p.depth} className="gallery-parallax">
                  <Image
                    src={img.src}
                    alt={img.alt[locale]}
                    width={img.w}
                    height={img.h}
                    sizes="(max-width: 767px) 92vw, 60vw"
                    placeholder="blur"
                    blurDataURL={img.blur}
                    loading={i < 2 ? "eager" : "lazy"}
                  />
                </span>
              </button>
              <figcaption className="gallery-cap">
                <span className="tabular">{String(i + 1).padStart(2, "0")}</span>
                {img.alt[locale]}
              </figcaption>
            </figure>
          );
        })}
      </div>

      <Lightbox images={images} locale={locale} t={t} index={open} onClose={() => setOpen(null)} onIndexChange={setOpen} />
    </>
  );
}
