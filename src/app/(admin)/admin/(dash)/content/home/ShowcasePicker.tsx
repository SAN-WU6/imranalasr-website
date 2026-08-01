"use client";

import { useMemo, useState } from "react";
import type { PickableProject } from "./HomeFigurePicker";

const key = (slug: string, src: string) => `${slug}::${src}`;
/** What the automatic composition takes from each project. */
const SUGGESTED_PER_PROJECT = 6;

/**
 * Picks the photographs used in the home projects scene. An empty selection is
 * a valid state: the site then composes the scene itself, which is what it did
 * before this panel existed.
 */
export default function ShowcasePicker({
  projects,
  initial,
}: {
  projects: PickableProject[];
  initial: string[];
}) {
  const [picked, setPicked] = useState<Set<string>>(() => new Set(initial));

  // Stored in project order; the site interleaves them when it builds the arm.
  const ordered = useMemo(
    () =>
      projects.flatMap((p) =>
        p.images.map((image) => key(p.slug, image.src)).filter((entry) => picked.has(entry))
      ),
    [projects, picked]
  );

  function toggle(entry: string) {
    setPicked((current) => {
      const next = new Set(current);
      if (next.has(entry)) next.delete(entry);
      else next.add(entry);
      return next;
    });
  }

  function setForProject(project: PickableProject, entries: string[]) {
    setPicked((current) => {
      const next = new Set(current);
      for (const image of project.images) next.delete(key(project.slug, image.src));
      for (const entry of entries) next.add(entry);
      return next;
    });
  }

  return (
    <>
      <input type="hidden" name="picks" value={JSON.stringify(ordered)} />

      <div className="a-upload" style={{ marginBottom: 4 }}>
        <div>
          <strong>
            المحدد: <span className="tabular">{ordered.length}</span> صورة
          </strong>
          <p className="a-hint">
            {ordered.length === 0
              ? "لا يوجد تحديد — سيختار الموقع الصور تلقائياً."
              : "سيعرض الموقع الصور المحددة فقط."}
          </p>
        </div>
        <button type="button" className="a-btn a-btn-ghost" onClick={() => setPicked(new Set())}>
          مسح التحديد (تلقائي)
        </button>
      </div>

      {projects.map((project) => {
        const entries = project.images.map((image) => key(project.slug, image.src));
        const count = entries.filter((entry) => picked.has(entry)).length;
        return (
          <section key={project.slug} style={{ marginTop: 18 }}>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                marginBottom: 10,
              }}
            >
              <strong>
                {project.title}{" "}
                <span className="a-hint tabular">
                  ({count} / {project.images.length})
                </span>
              </strong>
              <span style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                <button
                  type="button"
                  className="a-btn a-btn-ghost"
                  onClick={() => setForProject(project, entries.slice(0, SUGGESTED_PER_PROJECT))}
                >
                  أول {SUGGESTED_PER_PROJECT}
                </button>
                <button type="button" className="a-btn a-btn-ghost" onClick={() => setForProject(project, entries)}>
                  تحديد الكل
                </button>
                <button type="button" className="a-btn a-btn-ghost" onClick={() => setForProject(project, [])}>
                  إلغاء الكل
                </button>
              </span>
            </div>
            <div className="a-img-grid">
              {project.images.map((image) => {
                const entry = key(project.slug, image.src);
                const on = picked.has(entry);
                return (
                  <label key={image.src} className="a-img" data-selected={on}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image.src} alt={image.alt} loading="lazy" />
                    <span className="a-img-tools">
                      <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <input type="checkbox" checked={on} onChange={() => toggle(entry)} />
                        {on ? "ظاهرة" : "غير مختارة"}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </section>
        );
      })}
    </>
  );
}
