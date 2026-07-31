import Link from "next/link";
import { notFound } from "next/navigation";
import { getRowByRef, type ContactMessage } from "@/lib/db";
import { MESSAGE_STATUSES } from "@/lib/db/schema";
import { updateRequestAction } from "../../../actions";
import { STATUS_LABEL } from "../../labels";

export const dynamic = "force-dynamic";

export default async function MessageDetail({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  const row = await getRowByRef<ContactMessage>("contact_messages", ref);
  if (!row) notFound();

  const fields: [string, string][] = [
    ["الاسم", row.name],
    ["المنشأة", row.company || "—"],
    ["البريد الإلكتروني", row.email],
    ["رقم الجوال", row.phone || "—"],
    ["الموضوع", row.subject],
    ["الرسالة", row.message],
  ];

  return (
    <>
      <div className="a-head">
        <div>
          <p className="a-sub">
            <Link href="/admin/messages">← رسائل التواصل</Link>
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
            <h2>الرسالة</h2>
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
              <form action={updateRequestAction} style={{ display: "grid", gap: 12 }}>
                <input type="hidden" name="kind" value="messages" />
                <input type="hidden" name="ref" value={row.ref} />
                <div className="a-field">
                  <label htmlFor="status">الحالة</label>
                  <select id="status" name="status" className="a-select" defaultValue={row.status}>
                    {MESSAGE_STATUSES.map((s) => (
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
              <h2>رد سريع</h2>
            </div>
            <div className="a-panel-body">
              <a
                className="a-btn a-btn-ghost"
                href={`mailto:${row.email}?subject=${encodeURIComponent(`رد: ${row.subject} — ${row.ref}`)}`}
              >
                الرد بالبريد
              </a>
            </div>
          </section>
        </aside>
      </div>
    </>
  );
}
