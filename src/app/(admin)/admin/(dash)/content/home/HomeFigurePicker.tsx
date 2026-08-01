"use client";

import { useState } from "react";

export type PickableProject = {
  slug: string;
  title: string;
  location: string;
  images: { src: string; alt: string }[];
};

function parsePosition(raw: string) {
  const match = /^(\d{1,3})%\s+(\d{1,3})%$/.exec(raw.trim());
  if (!match) return { x: 50, y: 50 };
  return { x: Math.min(100, Number(match[1])), y: Math.min(100, Number(match[2])) };
}

/**
 * Chooses the photograph that opens the home page. The preview mirrors the
 * live frame — portrait, cropped by object-position — so the crop is decided
 * here rather than by trial and error on the public site.
 */
export default function HomeFigurePicker({
  projects,
  initialSlug,
  initialSrc,
  initialPosition,
}: {
  projects: PickableProject[];
  initialSlug: string;
  initialSrc: string;
  initialPosition: string;
}) {
  const [slug, setSlug] = useState(initialSlug);
  const [src, setSrc] = useState(initialSrc);
  const [pos, setPos] = useState(() => parsePosition(initialPosition));

  const project = projects.find((p) => p.slug === slug) ?? projects[0];
  const images = project?.images ?? [];
  const chosen = images.find((image) => image.src === src) ?? images[0];

  function changeProject(nextSlug: string) {
    setSlug(nextSlug);
    const next = projects.find((p) => p.slug === nextSlug);
    setSrc(next?.images[0]?.src ?? "");
  }

  return (
    <>
      <input type="hidden" name="projectSlug" value={project?.slug ?? ""} />
      <input type="hidden" name="src" value={chosen?.src ?? ""} />
      <input type="hidden" name="position" value={`${pos.x}% ${pos.y}%`} />

      <div className="a-form-grid">
        <div className="a-field">
          <label htmlFor="figure-project">المشروع</label>
          <select
            id="figure-project"
            className="a-select"
            value={project?.slug ?? ""}
            onChange={(event) => changeProject(event.target.value)}
          >
            {projects.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.title} — {p.location}
              </option>
            ))}
          </select>
          <span className="a-hint">يظهر اسم المشروع وموقعه أسفل الصورة في الموقع.</span>
        </div>

        <div className="a-field">
          <label htmlFor="figure-x">موضع القص الأفقي — <span className="tabular">{pos.x}%</span></label>
          <input
            id="figure-x"
            type="range"
            min={0}
            max={100}
            step={5}
            value={pos.x}
            onChange={(event) => setPos((current) => ({ ...current, x: Number(event.target.value) }))}
          />
          <label htmlFor="figure-y" style={{ marginTop: 8 }}>
            موضع القص العمودي — <span className="tabular">{pos.y}%</span>
          </label>
          <input
            id="figure-y"
            type="range"
            min={0}
            max={100}
            step={5}
            value={pos.y}
            onChange={(event) => setPos((current) => ({ ...current, y: Number(event.target.value) }))}
          />
        </div>
      </div>

      {chosen && (
        <div className="a-figure-preview">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={chosen.src} alt={chosen.alt} style={{ objectPosition: `${pos.x}% ${pos.y}%` }} />
          <p className="a-hint">معاينة الإطار كما يظهر في الصفحة الرئيسية</p>
        </div>
      )}

      <div className="a-img-grid" style={{ marginTop: 16 }}>
        {images.map((image) => (
          <label key={image.src} className="a-img" data-selected={image.src === chosen?.src}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image.src} alt={image.alt} loading="lazy" />
            <span className="a-img-tools">
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <input
                  type="radio"
                  name="figureChoice"
                  checked={image.src === chosen?.src}
                  onChange={() => setSrc(image.src)}
                />
                اختيار
              </span>
            </span>
          </label>
        ))}
      </div>
    </>
  );
}
