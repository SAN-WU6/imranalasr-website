import Link from "next/link";
import { notFound } from "next/navigation";
import { getRowByRef, type ProfileRequest } from "@/lib/db";
import { PROFILE_STATUSES } from "@/lib/db/schema";
import { updateRequestAction } from "../../../actions";
import { STATUS_LABEL } from "../../labels";

export const dynamic = "force-dynamic";

export default async function ProfileDetail({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  const row = await getRowByRef<ProfileRequest>("profile_requests", ref);
  if (!row) notFound();

  const fields: [string, string][] = [
    ["الاسم", row.name],
    ["المنشأة", row.company],
    ["المسمى الوظيفي", row.job_title || "—"],
    ["البريد المهني", row.email],
    ["رقم الجوال", row.phone],
    ["الفرصة المرتبطة", row.related_opportunity || "—"],
    ["سبب الطلب", row.reason],
  ];

  return (
    <>
      <div className="a-head">
        <div>
          <p className="a-sub">
            <Link href="/admin/profiles">← طلبات ملف التأهيل</Link>
          </p>
          <h1 className="a-title tabular">{row.ref}</h1>
          <p className="a-sub tabular">{row.created_at.replace("T", " ").slice(0, 19)}</p>
        </div>
        <span className="a-status" data-s={row.status}>
          {STATUS_LABEL[row.status] ?? row.status}
        </span>
      </div>

      <div className="a-detail">
        <section className="a-panel">
          <div className="a-panel-head">
            <h2>تفاصيل الطلب</h2>
          </div>
          <div className="a-panel-body">
            <dl className="a-dl">
              {fields.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
            <p className="a-note" style={{ marginTop: 16 }}>
              ملف التأهيل لا يُرسل تلقائياً. بعد التحقق من الجهة الطالبة، أرسل الملف يدوياً من البريد الرسمي وغيّر
              الحالة إلى «معتمد».
            </p>
          </div>
        </section>

        <aside>
          <section className="a-panel">
            <div className="a-panel-head">
              <h2>المراجعة</h2>
            </div>
            <div className="a-panel-body">
              <form action={updateRequestAction} style={{ display: "grid", gap: 12 }}>
                <input type="hidden" name="kind" value="profiles" />
                <input type="hidden" name="ref" value={row.ref} />
                <div className="a-field">
                  <label htmlFor="status">الحالة</label>
                  <select id="status" name="status" className="a-select" defaultValue={row.status}>
                    {PROFILE_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABEL[s]}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="a-field">
                  <label htmlFor="notes">ملاحظات داخلية</label>
                  <textarea id="notes" name="notes" className="a-textarea" defaultValue={row.notes} />
                </div>
                <button type="submit" className="a-btn">
                  حفظ
                </button>
              </form>
            </div>
          </section>

          <section className="a-panel">
            <div className="a-panel-head">
              <h2>تواصل سريع</h2>
            </div>
            <div className="a-panel-body" style={{ display: "grid", gap: 10 }}>
              <a className="a-btn a-btn-ghost" href={`mailto:${row.email}?subject=${encodeURIComponent(row.ref)}`}>
                بريد إلكتروني
              </a>
              <a className="a-btn a-btn-ghost" href={`tel:${row.phone}`}>
                اتصال
              </a>
            </div>
          </section>
        </aside>
      </div>
    </>
  );
}
