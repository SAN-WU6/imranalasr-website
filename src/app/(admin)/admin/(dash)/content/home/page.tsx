import Link from "next/link";
import { resolveHome, resolveProjects } from "@/lib/content";
import { totalRegisteredActivities } from "@/content/services";
import { getDictionary } from "@/i18n/dictionaries";
import { saveHomeFigureAction, saveHomeShowcaseAction, saveHomeStatsAction } from "../../../actions";
import HomeFigurePicker from "./HomeFigurePicker";
import ShowcasePicker from "./ShowcasePicker";

export const dynamic = "force-dynamic";

/**
 * The three parts of the home page that are presentation rather than fact:
 * the opening photograph, the documented figures, and the photographs used in
 * the projects scene. Statutory numbers stay in the code.
 */
export default async function HomeContentPage() {
  const projects = await resolveProjects();
  const home = await resolveHome(projects);
  const ar = getDictionary("ar");
  const en = getDictionary("en");

  // Only published projects appear on the home page, so only their photographs
  // can be chosen here.
  const pickable = projects.map((p) => ({
    slug: p.slug,
    title: p.title.ar,
    location: p.location.ar,
    images: (p.gallery.length ? p.gallery : [p.cover]).map((g) => ({ src: g.src, alt: g.alt.ar })),
  }));

  const counted: Record<string, number> = {
    activities: totalRegisteredActivities,
    isoSystems: 3,
    projects: projects.length,
    regions: new Set(projects.map((p) => p.location.ar)).size,
  };

  return (
    <>
      <div className="a-head">
        <div>
          <p className="a-sub">
            <Link href="/admin/content">← المحتوى</Link>
          </p>
          <h1 className="a-title">الصفحة الرئيسية</h1>
          <p className="a-sub">صورة «من نحن»، والبيانات الموثقة، وصور «غيضٌ من فيض»</p>
        </div>
        <Link className="a-btn a-btn-ghost" href="/ar" target="_blank">
          معاينة الموقع ↗
        </Link>
      </div>

      {pickable.length === 0 ? (
        <p className="a-note">لا توجد مشاريع منشورة بعد. انشر مشروعاً واحداً على الأقل لتتمكن من اختيار الصور.</p>
      ) : null}

      {/* ── Opening figure ───────────────────────────────────────── */}
      <form action={saveHomeFigureAction}>
        <section className="a-panel">
          <div className="a-panel-head">
            <h2>صورة «من نحن»</h2>
            <span className="a-sub">الصورة الظاهرة في بداية الصفحة الرئيسية</span>
          </div>
          <div className="a-panel-body">
            <p className="a-note" style={{ marginBottom: 14 }}>
              اختر المشروع ثم الصورة. يمكن ضبط موضع القص أفقياً وعمودياً حتى يظهر الجزء المطلوب داخل الإطار.
            </p>
            {pickable.length > 0 && (
              <HomeFigurePicker
                projects={pickable}
                initialSlug={home.figure?.project.slug ?? pickable[0].slug}
                initialSrc={home.figure?.image.src ?? pickable[0].images[0]?.src ?? ""}
                initialPosition={home.figure?.position ?? "50% 50%"}
              />
            )}
          </div>
        </section>
        {pickable.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <button type="submit" className="a-btn">
              حفظ صورة «من نحن»
            </button>
          </div>
        )}
      </form>

      {/* ── Documented figures ───────────────────────────────────── */}
      <form action={saveHomeStatsAction} style={{ marginTop: 18, display: "block" }}>
        <section className="a-panel">
          <div className="a-panel-head">
            <h2>البيانات الموثقة</h2>
            <span className="a-sub">الأرقام الأربعة تحت شريط «من نحن»</span>
          </div>
          <div className="a-panel-body" style={{ display: "grid", gap: 18 }}>
            <p className="a-note">
              اترك خانة الرقم فارغة ليُحسب تلقائياً من محتوى الموقع (عدد الأنشطة، عدد المشاريع المنشورة، عدد المناطق).
              اكتب رقماً لتثبيته يدوياً. النصوص تظهر أسفل كل رقم.
            </p>

            <div className="a-form-grid">
              <div className="a-field">
                <label>عنوان الشريط (عربي)</label>
                <input className="a-input" name="statsLabel_ar" defaultValue={home.stats.label?.ar ?? ar.home.statsLabel} />
              </div>
              <div className="a-field">
                <label>عنوان الشريط (إنجليزي)</label>
                <input
                  className="a-input"
                  name="statsLabel_en"
                  dir="ltr"
                  defaultValue={home.stats.label?.en ?? en.home.statsLabel}
                />
              </div>
            </div>

            {home.stats.items.map((item, i) => (
              <div key={item.key} className="a-form-grid" style={{ borderTop: i ? "1px solid var(--a-line)" : undefined, paddingTop: i ? 16 : 0 }}>
                <div className="a-field" data-full="true">
                  <strong>
                    <span className="tabular">{String(i + 1).padStart(2, "0")}</span> — {ar.home.stats[item.key]}{" "}
                    <span className="a-hint tabular">(المحسوب تلقائياً: {counted[item.key]})</span>
                  </strong>
                </div>
                <div className="a-field">
                  <label>الرقم (فارغ = تلقائي)</label>
                  <input
                    className="a-input tabular"
                    type="number"
                    min={0}
                    name={`value_${item.key}`}
                    defaultValue={item.value ?? ""}
                    placeholder={String(counted[item.key])}
                  />
                </div>
                <div className="a-field">
                  <label>ترتيب الظهور</label>
                  <input className="a-input tabular" type="number" min={1} name={`order_${item.key}`} defaultValue={item.order} />
                </div>
                <div className="a-field">
                  <label>النص (عربي)</label>
                  <input className="a-input" name={`label_${item.key}_ar`} defaultValue={item.label?.ar ?? ar.home.stats[item.key]} />
                </div>
                <div className="a-field">
                  <label>النص (إنجليزي)</label>
                  <input
                    className="a-input"
                    dir="ltr"
                    name={`label_${item.key}_en`}
                    defaultValue={item.label?.en ?? en.home.stats[item.key]}
                  />
                </div>
                <div className="a-field" data-full="true">
                  <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input type="checkbox" name={`published_${item.key}`} defaultChecked={item.published} /> ظاهر في الموقع
                  </label>
                </div>
              </div>
            ))}
          </div>
        </section>
        <div style={{ marginTop: 12 }}>
          <button type="submit" className="a-btn">
            حفظ البيانات الموثقة
          </button>
        </div>
      </form>

      {/* ── Home projects scene ──────────────────────────────────── */}
      <form action={saveHomeShowcaseAction} style={{ marginTop: 18, display: "block" }}>
        <section className="a-panel">
          <div className="a-panel-head">
            <h2>صور «غيضٌ من فيض»</h2>
            <span className="a-sub">الصور المتحركة في قسم المشاريع بالصفحة الرئيسية</span>
          </div>
          <div className="a-panel-body">
            <p className="a-note" style={{ marginBottom: 14 }}>
              حدّد الصور التي تريد ظهورها. إن لم تحدد أي صورة يختار الموقع تلقائياً ست صور من كل مشروع.
              يتم توزيع الصور المختارة بالتناوب بين المشاريع حتى لا تتجاور صور الموقع الواحد.
            </p>
            {pickable.length > 0 && (
              <ShowcasePicker
                projects={pickable}
                initial={home.showcase ? home.showcase.map((tile) => `${tile.slug}::${tile.src}`) : []}
              />
            )}
          </div>
        </section>
        {pickable.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <button type="submit" className="a-btn">
              حفظ صور المشاريع
            </button>
          </div>
        )}
      </form>
    </>
  );
}
