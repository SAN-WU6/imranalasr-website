import Link from "next/link";
import { createProjectAction } from "../../../../actions";

export const dynamic = "force-dynamic";

export default async function NewProject({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <>
      <div className="a-head">
        <div>
          <p className="a-sub"><Link href="/admin/content">← المحتوى</Link></p>
          <h1 className="a-title">إضافة مشروع</h1>
          <p className="a-sub">يُنشأ المشروع مخفياً، ثم أضف صوره وانشره بعد المراجعة.</p>
        </div>
      </div>
      {error && <p className="a-note" style={{ color: "#9c2f24" }}>
        {error === "exists" ? "الرابط المختصر مستخدم بالفعل." : "أدخل اسماً عربياً وإنجليزياً ورابطاً مختصراً صحيحاً."}
      </p>}
      <form action={createProjectAction} className="a-panel">
        <div className="a-panel-head"><h2>البيانات الأساسية</h2></div>
        <div className="a-panel-body a-form-grid">
          <div className="a-field">
            <label>اسم المشروع (عربي)</label>
            <input className="a-input" name="title_ar" required maxLength={160} />
          </div>
          <div className="a-field">
            <label>اسم المشروع (إنجليزي)</label>
            <input className="a-input" name="title_en" required maxLength={160} dir="ltr" />
          </div>
          <div className="a-field">
            <label>الرابط المختصر بالإنجليزية</label>
            <input className="a-input" name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="project-name" dir="ltr" />
            <span className="a-hint">حروف إنجليزية صغيرة وأرقام وشرطة فقط، ولا يمكن تغييره لاحقاً.</span>
          </div>
          <div className="a-field">
            <label>ترتيب الظهور</label>
            <input className="a-input tabular" type="number" name="order" min={1} defaultValue={99} />
          </div>
          <div className="a-field">
            <label>الموقع (عربي)</label>
            <input className="a-input" name="location_ar" />
          </div>
          <div className="a-field">
            <label>الموقع (إنجليزي)</label>
            <input className="a-input" name="location_en" dir="ltr" />
          </div>
          <div data-full="true" style={{ display: "flex", gap: 10 }}>
            <button className="a-btn" type="submit">إنشاء المشروع</button>
            <Link className="a-btn a-btn-ghost" href="/admin/content">إلغاء</Link>
          </div>
        </div>
      </form>
    </>
  );
}
