import { listRows, type QuoteRequest } from "@/lib/db";
import { QUOTE_STATUSES } from "@/lib/db/schema";
import { Filters, RequestsTable } from "../RequestsTable";
import { PROJECT_TYPE_LABEL } from "../labels";

export const dynamic = "force-dynamic";

export default async function QuotesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q ?? "";
  const status = sp.status ?? "all";
  const rows = await listRows<QuoteRequest>("quote_requests", { q, status, limit: 500 });

  const exportHref = `/api/admin/export?type=quotes&q=${encodeURIComponent(q)}&status=${encodeURIComponent(status)}`;

  return (
    <>
      <div className="a-head">
        <div>
          <h1 className="a-title">طلبات عرض السعر</h1>
          <p className="a-sub tabular">{rows.length} نتيجة</p>
        </div>
        <a className="a-btn" href={exportHref}>
          تصدير CSV
        </a>
      </div>

      <section className="a-panel">
        <div className="a-panel-head">
          <Filters base="/admin/quotes" statuses={QUOTE_STATUSES} q={q} status={status} />
        </div>
        <RequestsTable
          base="/admin/quotes"
          rows={rows}
          columns={[
            { key: "company", label: "المنشأة", render: (r) => r.company },
            { key: "name", label: "المسؤول", render: (r) => r.name },
            { key: "type", label: "نوع المشروع", render: (r) => PROJECT_TYPE_LABEL[r.project_type] ?? r.project_type },
            { key: "loc", label: "الموقع", render: (r) => r.project_location },
            { key: "phone", label: "الجوال", ltr: true, render: (r) => <span className="tabular">{r.phone}</span> },
          ]}
        />
      </section>
    </>
  );
}
