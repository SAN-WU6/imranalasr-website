import Link from "next/link";
import { STATUS_LABEL } from "./labels";

export type Column<T> = { key: string; label: string; render: (row: T) => React.ReactNode; ltr?: boolean };

export function Filters({ base, statuses, q, status }: { base: string; statuses: string[]; q: string; status: string }) {
  return (
    <form className="a-toolbar" action={base} method="get" role="search">
      <input
        className="a-input"
        type="search"
        name="q"
        defaultValue={q}
        placeholder="بحث بالمرجع أو الاسم أو المنشأة أو البريد…"
        aria-label="بحث"
        style={{ minWidth: 260, flex: "1 1 260px" }}
      />
      <select className="a-select" name="status" defaultValue={status} aria-label="الحالة">
        <option value="all">كل الحالات</option>
        {statuses.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABEL[s] ?? s}
          </option>
        ))}
      </select>
      <button type="submit" className="a-btn a-btn-ghost">
        تصفية
      </button>
    </form>
  );
}

export function RequestsTable<T extends { ref: string; status: string; created_at: string }>({
  rows,
  columns,
  base,
}: {
  rows: T[];
  columns: Column<T>[];
  base: string;
}) {
  if (rows.length === 0) return <p className="a-panel-body">لا توجد نتائج.</p>;
  return (
    <div className="a-table-wrap">
      <table className="a-table">
        <thead>
          <tr>
            <th>المرجع</th>
            {columns.map((c) => (
              <th key={c.key}>{c.label}</th>
            ))}
            <th>الحالة</th>
            <th>تاريخ الاستلام</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.ref}>
              <td>
                <Link href={`${base}/${row.ref}`} className="tabular">
                  {row.ref}
                </Link>
              </td>
              {columns.map((c) => (
                <td key={c.key} dir={c.ltr ? "ltr" : undefined}>
                  {c.render(row)}
                </td>
              ))}
              <td>
                <span className="a-status" data-s={row.status}>
                  {STATUS_LABEL[row.status] ?? row.status}
                </span>
              </td>
              <td className="tabular">{row.created_at.slice(0, 16).replace("T", " ")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
