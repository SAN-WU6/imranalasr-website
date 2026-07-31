import { listRows, type ProfileRequest } from "@/lib/db";
import { PROFILE_STATUSES } from "@/lib/db/schema";
import { Filters, RequestsTable } from "../RequestsTable";

export const dynamic = "force-dynamic";

export default async function ProfilesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q ?? "";
  const status = sp.status ?? "all";
  const rows = await listRows<ProfileRequest>("profile_requests", { q, status, limit: 500 });

  return (
    <>
      <div className="a-head">
        <div>
          <h1 className="a-title">طلبات ملف التأهيل</h1>
          <p className="a-sub tabular">{rows.length} نتيجة</p>
        </div>
        <a
          className="a-btn"
          href={`/api/admin/export?type=profiles&q=${encodeURIComponent(q)}&status=${encodeURIComponent(status)}`}
        >
          تصدير CSV
        </a>
      </div>

      <section className="a-panel">
        <div className="a-panel-head">
          <Filters base="/admin/profiles" statuses={PROFILE_STATUSES} q={q} status={status} />
        </div>
        <RequestsTable
          base="/admin/profiles"
          rows={rows}
          columns={[
            { key: "company", label: "المنشأة", render: (r) => r.company },
            { key: "name", label: "مقدّم الطلب", render: (r) => r.name },
            { key: "email", label: "البريد المهني", ltr: true, render: (r) => r.email },
            { key: "opp", label: "الفرصة المرتبطة", render: (r) => r.related_opportunity || "—" },
          ]}
        />
      </section>
    </>
  );
}
