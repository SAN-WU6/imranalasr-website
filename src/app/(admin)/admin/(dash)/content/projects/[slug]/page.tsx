import Link from "next/link";
import { notFound } from "next/navigation";
import { resolveProjectForAdmin } from "@/lib/content";
import { saveProjectAction } from "../../../../actions";
import ProjectImageManager from "./ProjectImageManager";
import DeleteProjectButton from "./DeleteProjectButton";
import type { ProjectImageRow } from "@/lib/db/projects";

export const dynamic = "force-dynamic";

export default async function EditProject({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await resolveProjectForAdmin(slug);
  if (!p) notFound();
  const cmsImages = (p as { images?: ProjectImageRow[] }).images ?? null;

  return (
    <>
      <div className="a-head">
        <div>
          <p className="a-sub">
            <Link href="/admin/content">← المحتوى</Link>
          </p>
          <h1 className="a-title">{p.title.ar}</h1>
          <p className="a-sub tabular">{p.slug}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          {cmsImages && (
            <Link className="a-btn a-btn-ghost" href="#project-images">
              إدارة الصور ↓
            </Link>
          )}
          {cmsImages && <DeleteProjectButton slug={p.slug} />}
        </div>
      </div>

      <form action={saveProjectAction}>
        <input type="hidden" name="slug" value={p.slug} />

        <section className="a-panel">
          <div className="a-panel-head">
            <h2>النشر والترتيب</h2>
          </div>
          <div className="a-panel-body a-form-grid">
            <div className="a-field">
              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="checkbox" name="published" defaultChecked={p.published} /> منشور على الموقع
              </label>
            </div>
            <div className="a-field">
              <label htmlFor="order">ترتيب الظهور</label>
              <input id="order" className="a-input tabular" type="number" name="order" min={1} defaultValue={p.order} />
            </div>
          </div>
        </section>

        <section className="a-panel">
          <div className="a-panel-head">
            <h2>النصوص</h2>
            <span className="a-sub">اتركها كما هي إن لم ترغب في التعديل</span>
          </div>
          <div className="a-panel-body a-form-grid">
            <div className="a-field">
              <label>الاسم (عربي)</label>
              <input className="a-input" name="title_ar" defaultValue={p.title.ar} />
            </div>
            <div className="a-field">
              <label>الاسم (إنجليزي)</label>
              <input className="a-input" name="title_en" defaultValue={p.title.en} dir="ltr" />
            </div>
            <div className="a-field">
              <label>اسم مختصر (عربي)</label>
              <input className="a-input" name="shortTitle_ar" defaultValue={p.shortTitle.ar} />
            </div>
            <div className="a-field">
              <label>اسم مختصر (إنجليزي)</label>
              <input className="a-input" name="shortTitle_en" defaultValue={p.shortTitle.en} dir="ltr" />
            </div>
            <div className="a-field">
              <label>الموقع (عربي)</label>
              <input className="a-input" name="location_ar" defaultValue={p.location.ar} />
            </div>
            <div className="a-field">
              <label>الموقع (إنجليزي)</label>
              <input className="a-input" name="location_en" defaultValue={p.location.en} dir="ltr" />
            </div>
            <div className="a-field" data-full="true">
              <label>الوصف (عربي)</label>
              <textarea className="a-textarea" name="summary_ar" defaultValue={p.summary.ar} />
            </div>
            <div className="a-field" data-full="true">
              <label>الوصف (إنجليزي)</label>
              <textarea className="a-textarea" name="summary_en" defaultValue={p.summary.en} dir="ltr" />
            </div>
            <div className="a-field" data-full="true">
              <label>ما توثّقه الصور (عربي) — سطر لكل بند</label>
              <textarea className="a-textarea" name="documented_ar" rows={7} defaultValue={p.documented.ar.join("\n")} />
            </div>
            <div className="a-field" data-full="true">
              <label>ما توثّقه الصور (إنجليزي) — سطر لكل بند</label>
              <textarea
                className="a-textarea"
                name="documented_en"
                rows={7}
                defaultValue={p.documented.en.join("\n")}
                dir="ltr"
              />
            </div>
          </div>
        </section>

        <section className="a-panel">
          <div className="a-panel-head">
            <h2>بيانات SEO</h2>
          </div>
          <div className="a-panel-body a-form-grid">
            <div className="a-field">
              <label>عنوان الصفحة (عربي)</label>
              <input className="a-input" name="seoTitle_ar" defaultValue={p.seo.title.ar} />
            </div>
            <div className="a-field">
              <label>عنوان الصفحة (إنجليزي)</label>
              <input className="a-input" name="seoTitle_en" defaultValue={p.seo.title.en} dir="ltr" />
            </div>
            <div className="a-field" data-full="true">
              <label>الوصف (عربي)</label>
              <textarea className="a-textarea" name="seoDescription_ar" defaultValue={p.seo.description.ar} />
            </div>
            <div className="a-field" data-full="true">
              <label>الوصف (إنجليزي)</label>
              <textarea className="a-textarea" name="seoDescription_en" defaultValue={p.seo.description.en} dir="ltr" />
            </div>
          </div>
        </section>

        {cmsImages ? (
          <ProjectImageManager slug={p.slug} initial={cmsImages} initialCover={p.cover.src} />
        ) : (
          <p className="a-note">يجب تهيئة قاعدة بيانات المشاريع قبل إدارة الصور.</p>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <button type="submit" className="a-btn">
            حفظ المشروع
          </button>
          <Link className="a-btn a-btn-ghost" href={`/ar/projects/${p.slug}`} target="_blank">
            معاينة الصفحة ↗
          </Link>
        </div>
      </form>
    </>
  );
}
