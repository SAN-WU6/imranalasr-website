import Link from "next/link";
import { countByStatus, listRows, type ContactMessage, type ProfileRequest, type QuoteRequest } from "@/lib/db";
import { STATUS_LABEL } from "./labels";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [quoteCounts, profileCounts, messageCounts, latestQuotes, latestProfiles, latestMessages] = await Promise.all([
    countByStatus("quote_requests"),
    countByStatus("profile_requests"),
    countByStatus("contact_messages"),
    listRows<QuoteRequest>("quote_requests", { limit: 6 }),
    listRows<ProfileRequest>("profile_requests", { limit: 5 }),
    listRows<ContactMessage>("contact_messages", { limit: 5 }),
  ]);

  const sum = (m: Record<string, number>) => Object.values(m).reduce((a, b) => a + b, 0);

  const cards = [
    { n: sum(quoteCounts), l: "طلبات عرض سعر", href: "/admin/quotes", nw: quoteCounts.new ?? 0 },
    { n: sum(profileCounts), l: "طلبات ملف تأهيل", href: "/admin/profiles", nw: profileCounts.new ?? 0 },
    { n: sum(messageCounts), l: "رسائل تواصل", href: "/admin/messages", nw: messageCounts.new ?? 0 },
  ];

  return (
    <>
      <div className="a-head">
        <div>
          <h1 className="a-title">نظرة عامة</h1>
          <p className="a-sub">ملخص الطلبات الواردة عبر الموقع</p>
        </div>
      </div>

      <div className="a-cards">
        {cards.map((c) => (
          <Link key={c.href} href={c.href} className="a-card">
            <p className="a-card-n tabular">{c.n}</p>
            <p className="a-card-l">{c.l}</p>
            {c.nw > 0 ? (
              <p className="a-card-l" style={{ color: "var(--a-accent)", fontWeight: 600 }}>
                {c.nw} جديد
              </p>
            ) : null}
          </Link>
        ))}
      </div>

      <section className="a-panel">
        <div className="a-panel-head">
          <h2>أحدث طلبات عرض السعر</h2>
          <Link href="/admin/quotes" className="a-btn a-btn-ghost">
            عرض الكل
          </Link>
        </div>
        <div className="a-table-wrap">
          <table className="a-table">
            <thead>
              <tr>
                <th>المرجع</th>
                <th>المنشأة</th>
                <th>الموقع</th>
                <th>الحالة</th>
                <th>التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {latestQuotes.length === 0 ? (
                <tr>
                  <td colSpan={5}>لا توجد طلبات بعد.</td>
                </tr>
              ) : (
                latestQuotes.map((q) => (
                  <tr key={q.ref}>
                    <td>
                      <Link href={`/admin/quotes/${q.ref}`} className="tabular">
                        {q.ref}
                      </Link>
                    </td>
                    <td>{q.company}</td>
                    <td>{q.project_location}</td>
                    <td>
                      <span className="a-status" data-s={q.status}>
                        {STATUS_LABEL[q.status] ?? q.status}
                      </span>
                    </td>
                    <td className="tabular">{q.created_at.slice(0, 16).replace("T", " ")}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="a-panel">
        <div className="a-panel-head">
          <h2>أحدث طلبات ملف التأهيل</h2>
          <Link href="/admin/profiles" className="a-btn a-btn-ghost">
            عرض الكل
          </Link>
        </div>
        <div className="a-table-wrap">
          <table className="a-table">
            <thead>
              <tr>
                <th>المرجع</th>
                <th>المنشأة</th>
                <th>البريد</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {latestProfiles.length === 0 ? (
                <tr>
                  <td colSpan={4}>لا توجد طلبات بعد.</td>
                </tr>
              ) : (
                latestProfiles.map((p) => (
                  <tr key={p.ref}>
                    <td>
                      <Link href={`/admin/profiles/${p.ref}`} className="tabular">
                        {p.ref}
                      </Link>
                    </td>
                    <td>{p.company}</td>
                    <td dir="ltr">{p.email}</td>
                    <td>
                      <span className="a-status" data-s={p.status}>
                        {STATUS_LABEL[p.status] ?? p.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="a-panel">
        <div className="a-panel-head">
          <h2>أحدث الرسائل</h2>
          <Link href="/admin/messages" className="a-btn a-btn-ghost">
            عرض الكل
          </Link>
        </div>
        <div className="a-table-wrap">
          <table className="a-table">
            <thead>
              <tr>
                <th>المرجع</th>
                <th>المرسل</th>
                <th>الموضوع</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {latestMessages.length === 0 ? (
                <tr>
                  <td colSpan={4}>لا توجد رسائل بعد.</td>
                </tr>
              ) : (
                latestMessages.map((m) => (
                  <tr key={m.ref}>
                    <td>
                      <Link href={`/admin/messages/${m.ref}`} className="tabular">
                        {m.ref}
                      </Link>
                    </td>
                    <td>{m.name}</td>
                    <td>{m.subject}</td>
                    <td>
                      <span className="a-status" data-s={m.status}>
                        {STATUS_LABEL[m.status] ?? m.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
