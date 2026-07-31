"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { ProjectImageRow } from "@/lib/db/projects";

export default function ProjectImageManager({ slug, initial, initialCover }: {
  slug: string;
  initial: ProjectImageRow[];
  initialCover: string;
}) {
  const [items, setItems] = useState(initial);
  const [cover, setCover] = useState(initialCover);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const drag = useRef<number | null>(null);
  const router = useRouter();

  function move(from: number, to: number) {
    if (from === to || to < 0 || to >= items.length) return;
    setItems((current) => {
      const next = [...current];
      const [picked] = next.splice(from, 1);
      next.splice(to, 0, picked);
      return next;
    });
  }

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setMessage("");
    try {
      for (const file of Array.from(files)) {
        const body = new FormData();
        body.append("file", file);
        const res = await fetch(`/api/admin/projects/${encodeURIComponent(slug)}/images`, { method: "POST", body });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "تعذر رفع الصورة");
      }
      setMessage("تم رفع الصور.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "تعذر رفع الصور");
    } finally {
      setBusy(false);
    }
  }

  async function remove(item: ProjectImageRow) {
    if (!confirm("هل تريد حذف هذه الصورة من المشروع؟")) return;
    setBusy(true);
    setMessage("");
    const res = await fetch(`/api/admin/projects/${encodeURIComponent(slug)}/images/${item.id}`, { method: "DELETE" });
    const data = await res.json();
    if (res.ok) {
      setItems((current) => current.filter((candidate) => candidate.id !== item.id));
      if (cover === item.src) setCover("");
      setMessage("تم حذف الصورة.");
      router.refresh();
    } else {
      setMessage(data.error || "تعذر حذف الصورة");
    }
    setBusy(false);
  }

  return (
    <section id="project-images" className="a-panel" style={{ scrollMarginTop: 24 }}>
      <div className="a-panel-head">
        <h2>الصور</h2>
        <span className="a-sub tabular">{items.length} صورة</span>
      </div>
      <div className="a-panel-body">
        <input type="hidden" name="imageState" value={JSON.stringify(items)} />
        <input type="hidden" name="coverSrc" value={cover} />
        <div className="a-upload">
          <div>
            <strong>رفع صور جديدة</strong>
            <p className="a-hint">JPG أو PNG أو WebP، بحد أقصى 4 ميجابايت للصورة. يتم تحسينها تلقائياً.</p>
          </div>
          <label className="a-btn" style={{ cursor: busy ? "wait" : "pointer" }}>
            {busy ? "جارٍ التنفيذ…" : "اختيار الصور"}
            <input hidden type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={busy} onChange={(event) => upload(event.target.files)} />
          </label>
        </div>
        {message && <p className="a-note" role="status" style={{ marginTop: 12 }}>{message}</p>}

        {items.length === 0 ? (
          <p className="a-note" style={{ marginTop: 16 }}>لا توجد صور بعد. ارفع صورة واحدة على الأقل قبل نشر المشروع.</p>
        ) : (
          <div className="a-img-manage-grid">
            {items.map((item, index) => (
              <article
                key={item.id}
                className="a-img-manage"
                draggable
                onDragStart={() => { drag.current = index; }}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => { if (drag.current !== null) move(drag.current, index); drag.current = null; }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.src} alt={item.alt_ar} loading="lazy" />
                <div className="a-img-manage-body">
                  <div className="a-img-order">
                    <span className="tabular">{String(index + 1).padStart(2, "0")}</span>
                    <button type="button" onClick={() => move(index, index - 1)} disabled={index === 0}>↑</button>
                    <button type="button" onClick={() => move(index, index + 1)} disabled={index === items.length - 1}>↓</button>
                    <span className="a-hint">اسحب للترتيب</span>
                  </div>
                  <label><input type="radio" name="coverChoice" checked={cover === item.src} onChange={() => setCover(item.src)} /> صورة الغلاف</label>
                  <label><input type="checkbox" checked={item.visible} onChange={(event) => setItems((current) => current.map((candidate) => candidate.id === item.id ? { ...candidate, visible: event.target.checked } : candidate))} /> ظاهرة في المعرض</label>
                  <label>الوصف العربي<input className="a-input" value={item.alt_ar} onChange={(event) => setItems((current) => current.map((candidate) => candidate.id === item.id ? { ...candidate, alt_ar: event.target.value } : candidate))} /></label>
                  <label>الوصف الإنجليزي<input className="a-input" dir="ltr" value={item.alt_en} onChange={(event) => setItems((current) => current.map((candidate) => candidate.id === item.id ? { ...candidate, alt_en: event.target.value } : candidate))} /></label>
                  <button type="button" className="a-danger-link" disabled={busy} onClick={() => remove(item)}>حذف الصورة</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
