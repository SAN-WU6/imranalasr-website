import Link from "next/link";
import { notFound } from "next/navigation";
import { getRowByRef, type QuoteRequest } from "@/lib/db";
import { QUOTE_STATUSES } from "@/lib/db/schema";
import { updateRequestAction } from "../../../actions";
import { CONTACT_LABEL, DURATION_LABEL, PROJECT_TYPE_LABEL, START_LABEL, STATUS_LABEL } from "../../labels";

export const dynamic = "force-dynamic";

export default async function QuoteDetail({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  const row = await getRowByRef<QuoteRequest>("quote_requests", ref);
  if (!row) notFound();

  const fields: [string, string][] = [
    ["الاسم", row.name],
    ["المنشأة", row.company],
    ["المسمى الوظيفي", row.job_title || "—"],
    ["رقم الجوال", row.phone],
    ["البريد الإلكتروني", row.email],
    ["نوع المشروع", PROJECT_TYPE_LABEL[row.project_type] ?? row.project_type],
    ["موقع المشروع", row.project_location],
    ["نطاق الأعمال", row.scope_of_work],
    ["وصف المشروع", row.description],
    ["موعد البدء", START_LABEL[row.start_window ?? "unknown"] ?? "—"],
    ["المدة المتوقعة", DURATION_LABEL[row.duration ?? "unknown"] ?? "—"],
    ["طريقة التواصل المفضلة", CONTACT_LABEL[row.preferred_contact] ?? row.preferred_contact],
    ["لغة النموذج", row.locale === "en" ? "English" : "العربية"],
  ];

  const waText = `مرحباً ${row.name}، بخصوص طلبكم رقم ${row.ref} — شركة عمران العصر الحديثة للمقاولات.`;

  return (
    <>
      <div className="a-head">
        <div>
          <p className="a-sub">
            <Link href="/admin/quotes">← طلبات عرض السعر</Link>
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
          </div>
        </section>

        <aside>
          <section className="a-panel">
            <div className="a-panel-head">
              <h2>المتابعة</h2>
            </div>
            <div className="a-panel-body">
              <form action={updateRequestAction} className="a-field" style={{ gap: 12 }}>
                <input type="hidden" name="kind" value="quotes" />
                <input type="hidden" name="ref" value={row.ref} />

                <div className="a-field">
                  <label htmlFor="status">الحالة</label>
                  <select id="status" name="status" className="a-select" defaultValue={row.status}>
                    {QUOTE_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABEL[s]}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="a-field">
                  <label htmlFor="notes">ملاحظات داخلية</label>
                  <textarea id="notes" name="notes" className="a-textarea" defaultValue={row.notes} />
                  <p className="a-hint">لا تظهر هذه الملاحظات لمقدّم الطلب.</p>
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
              <a className="a-btn a-btn-ghost" href={`tel:${row.phone}`}>
                اتصال
              </a>
              <a
                className="a-btn a-btn-ghost"
                href={`https://wa.me/${row.phone.replace(/\D/g, "")}?text=${encodeURIComponent(waText)}`}
                target="_blank"
                rel="noreferrer noopener"
              >
                واتساب
              </a>
              <a className="a-btn a-btn-ghost" href={`mailto:${row.email}?subject=${encodeURIComponent(row.ref)}`}>
                بريد إلكتروني
              </a>
            </div>
          </section>
        </aside>
      </div>
    </>
  );
}
