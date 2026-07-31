import { listRows, type ContactMessage } from "@/lib/db";
import { MESSAGE_STATUSES } from "@/lib/db/schema";
import { Filters, RequestsTable } from "../RequestsTable";

export const dynamic = "force-dynamic";

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q ?? "";
  const status = sp.status ?? "all";
  const rows = await listRows<ContactMessage>("contact_messages", { q, status, limit: 500 });

  return (
    <>
      <div className="a-head">
        <div>
          <h1 className="a-title">رسائل التواصل</h1>
          <p className="a-sub tabular">{rows.length} نتيجة</p>
        </div>
        <a
          className="a-btn"
          href={`/api/admin/export?type=messages&q=${encodeURIComponent(q)}&status=${encodeURIComponent(status)}`}
        >
          تصدير CSV
        </a>
      </div>

      <section className="a-panel">
        <div className="a-panel-head">
          <Filters base="/admin/messages" statuses={MESSAGE_STATUSES} q={q} status={status} />
        </div>
        <RequestsTable
          base="/admin/messages"
          rows={rows}
          columns={[
            { key: "name", label: "المرسل", render: (r) => r.name },
            { key: "company", label: "المنشأة", render: (r) => r.company || "—" },
            { key: "subject", label: "الموضوع", render: (r) => r.subject },
            { key: "email", label: "البريد", ltr: true, render: (r) => r.email },
          ]}
        />
      </section>
    </>
  );
}
