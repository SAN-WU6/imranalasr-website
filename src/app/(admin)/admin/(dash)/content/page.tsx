import Link from "next/link";
import {
  resolveCompany,
  resolveCredentials,
  resolveNotificationEmail,
  resolveProjects,
  resolveServices,
} from "@/lib/content";
import {
  saveCompanyAction,
  saveCredentialAction,
  saveNotificationsAction,
  saveServiceAction,
  seedProjectsAction,
} from "../../actions";

export const dynamic = "force-dynamic";

const MAIL_NOTICE: Record<string, { tone: "ok" | "error"; text: string }> = {
  saved: { tone: "ok", text: "تم حفظ بريد استقبال الطلبات. ستصل الطلبات الجديدة إليه." },
  cleared: { tone: "ok", text: "تم مسح البريد المخصص. عادت الطلبات إلى البريد المهيّأ في الاستضافة." },
  invalid: { tone: "error", text: "صيغة البريد الإلكتروني غير صحيحة. لم يتم الحفظ." },
};

export default async function ContentPage({
  searchParams,
}: {
  searchParams: Promise<{ mail?: string }>;
}) {
  const [{ mail }, projects, services, credentials, company, notifications] = await Promise.all([
    searchParams,
    resolveProjects(true),
    resolveServices(true),
    resolveCredentials(true),
    resolveCompany(),
    resolveNotificationEmail(),
  ]);
  const cmsReady = projects.some((project) => "cms" in project);
  const mailNotice = mail ? MAIL_NOTICE[mail] : undefined;

  return (
    <>
      <div className="a-head">
        <div>
          <h1 className="a-title">المحتوى</h1>
          <p className="a-sub">النشر والترتيب والنصوص العربية والإنجليزية</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <Link className="a-btn a-btn-ghost" href="/admin/content/home">الصفحة الرئيسية</Link>
          <Link className="a-btn" href="/admin/content/projects/new">+ إضافة مشروع</Link>
        </div>
      </div>

      <p className="a-note">
        البيانات النظامية (السجل التجاري، الرقم الموحد، الرقم الضريبي، أرقام الشهادات) مقفلة في الشيفرة لأنها منقولة
        من الوثائق الرسمية. القابل للتعديل هنا هو النشر والترتيب والنصوص التحريرية وبيانات التواصل.
      </p>

      {!cmsReady && (
        <form action={seedProjectsAction} className="a-note" style={{ marginTop: 12 }}>
          <strong style={{ display: "block", color: "var(--a-fg)", marginBottom: 6 }}>خطوة تهيئة واحدة</strong>
          <span>انقل المشاريع الحالية إلى نظام الإدارة الجديد لتفعيل الإضافة والحذف ورفع الصور.</span>{" "}
          <button className="a-btn" type="submit" style={{ marginInlineStart: 10 }}>تفعيل إدارة المشاريع</button>
        </form>
      )}

      {/* ── Projects ─────────────────────────────────────────────── */}
      <section className="a-panel">
        <div className="a-panel-head">
          <h2>المشاريع</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span className="a-sub tabular">{projects.length}</span>
            <Link href="/admin/content/projects/new">إضافة مشروع</Link>
          </div>
        </div>
        <div className="a-panel-body" style={{ paddingBottom: 0 }}>
          <p className="a-hint">استخدم «إدارة الصور» لرفع الصور وحذفها وتعديل وصفها واختيار الغلاف وترتيبها وإخفائها.</p>
        </div>
        <div className="a-table-wrap">
          <table className="a-table">
            <thead>
              <tr>
                <th>الترتيب</th>
                <th>المشروع</th>
                <th>الموقع</th>
                <th>الصور</th>
                <th>الحالة</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.slug}>
                  <td className="tabular">{p.order}</td>
                  <td>{p.title.ar}</td>
                  <td>{p.location.ar}</td>
                  <td className="tabular">{p.gallery.length}</td>
                  <td>
                    <span className="a-status" data-s={p.published ? "approved" : "closed"}>
                      {p.published ? "منشور" : "مخفي"}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                      <Link href={`/admin/content/projects/${p.slug}`}>تحرير البيانات</Link>
                      <Link className="a-btn a-btn-ghost" href={`/admin/content/projects/${p.slug}#project-images`}>
                        إدارة الصور
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Services ─────────────────────────────────────────────── */}
      <section className="a-panel">
        <div className="a-panel-head">
          <h2>الخدمات</h2>
          <span className="a-sub">الأنشطة وأرقامها مقفلة — يمكن تعديل العنوان والوصف والترتيب</span>
        </div>
        <div className="a-panel-body" style={{ display: "grid", gap: 18 }}>
          {services.map((s, i) => (
            <form key={s.slug} action={saveServiceAction} className="a-form-grid">
              <input type="hidden" name="slug" value={s.slug} />
              <div className="a-field" data-full="true">
                <strong>
                  <span className="tabular">{s.index}</span> — {s.title.ar}{" "}
                  <span className="a-hint tabular">({s.activities.length} نشاطاً)</span>
                </strong>
              </div>
              <div className="a-field">
                <label>العنوان (عربي)</label>
                <input className="a-input" name="title_ar" defaultValue={s.title.ar} />
              </div>
              <div className="a-field">
                <label>العنوان (إنجليزي)</label>
                <input className="a-input" name="title_en" defaultValue={s.title.en} dir="ltr" />
              </div>
              <div className="a-field">
                <label>الوصف (عربي)</label>
                <textarea className="a-textarea" name="lead_ar" defaultValue={s.lead.ar} />
              </div>
              <div className="a-field">
                <label>الوصف (إنجليزي)</label>
                <textarea className="a-textarea" name="lead_en" defaultValue={s.lead.en} dir="ltr" />
              </div>
              <div className="a-field">
                <label>ترتيب الظهور</label>
                <input className="a-input tabular" type="number" name="order" min={1} defaultValue={i + 1} />
              </div>
              <div className="a-field">
                <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input type="checkbox" name="published" defaultChecked={s.published} /> منشور
                </label>
              </div>
              <div data-full="true">
                <button type="submit" className="a-btn">
                  حفظ الخدمة
                </button>
              </div>
            </form>
          ))}
        </div>
      </section>

      {/* ── Credentials ──────────────────────────────────────────── */}
      <section className="a-panel">
        <div className="a-panel-head">
          <h2>الشهادات والاعتمادات</h2>
          <span className="a-sub">بيانات الشهادات مقفلة — يمكن التحكم في الظهور والترتيب</span>
        </div>
        <div className="a-table-wrap">
          <table className="a-table">
            <thead>
              <tr>
                <th>الشهادة</th>
                <th>الجهة</th>
                <th>الترتيب</th>
                <th>الظهور</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {credentials.map((c, i) => (
                <tr key={c.id}>
                  <td>
                    <span className="tabular">{c.code.ar}</span> — {c.title.ar}
                  </td>
                  <td>{c.issuer.ar}</td>
                  <td>
                    <form action={saveCredentialAction} id={`cred-${c.id}`} style={{ display: "contents" }} />
                    <input form={`cred-${c.id}`} type="hidden" name="id" value={c.id} />
                    <input
                      form={`cred-${c.id}`}
                      className="a-input tabular"
                      type="number"
                      name="order"
                      min={1}
                      defaultValue={i + 1}
                      style={{ width: 80 }}
                    />
                  </td>
                  <td>
                    <input
                      form={`cred-${c.id}`}
                      type="checkbox"
                      name="published"
                      defaultChecked={(c as { published?: boolean }).published ?? true}
                    />
                  </td>
                  <td>
                    <button form={`cred-${c.id}`} type="submit" className="a-btn a-btn-ghost">
                      حفظ
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Company contact ──────────────────────────────────────── */}
      <section className="a-panel">
        <div className="a-panel-head">
          <h2>بيانات التواصل</h2>
        </div>
        <div className="a-panel-body">
          <form action={saveCompanyAction} className="a-form-grid">
            <div className="a-field">
              <label>البريد الإلكتروني</label>
              <input className="a-input" name="email" defaultValue={company.contact.email} dir="ltr" />
            </div>
            <div className="a-field">
              <label>واتساب (دولي بدون +)</label>
              <input className="a-input tabular" name="whatsapp" defaultValue={company.contact.whatsapp} dir="ltr" />
            </div>
            <div className="a-field">
              <label>الهاتف الأول (دولي)</label>
              <input className="a-input tabular" name="phonePrimary" defaultValue={company.contact.phonePrimary} dir="ltr" />
            </div>
            <div className="a-field">
              <label>الهاتف الأول (للعرض)</label>
              <input
                className="a-input tabular"
                name="phonePrimaryDisplay"
                defaultValue={company.contact.phonePrimaryDisplay}
                dir="ltr"
              />
            </div>
            <div className="a-field">
              <label>الهاتف الثاني (دولي)</label>
              <input className="a-input tabular" name="phoneSecondary" defaultValue={company.contact.phoneSecondary} dir="ltr" />
            </div>
            <div className="a-field">
              <label>الهاتف الثاني (للعرض)</label>
              <input
                className="a-input tabular"
                name="phoneSecondaryDisplay"
                defaultValue={company.contact.phoneSecondaryDisplay}
                dir="ltr"
              />
            </div>
            <div className="a-field" data-full="true">
              <label>العنوان (عربي)</label>
              <input className="a-input" name="addressAr" defaultValue={company.address.lines.ar} />
            </div>
            <div className="a-field" data-full="true">
              <label>العنوان (إنجليزي)</label>
              <input className="a-input" name="addressEn" defaultValue={company.address.lines.en} dir="ltr" />
            </div>
            <div className="a-field">
              <label>أوقات العمل (عربي)</label>
              <input className="a-input" name="hoursAr" defaultValue={company.hours.ar} />
            </div>
            <div className="a-field">
              <label>أوقات العمل (إنجليزي)</label>
              <input className="a-input" name="hoursEn" defaultValue={company.hours.en} dir="ltr" />
            </div>
            <div data-full="true">
              <button type="submit" className="a-btn">
                حفظ بيانات التواصل
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* ── Notification mailbox ─────────────────────────────────── */}
      <section className="a-panel" id="notifications" style={{ scrollMarginTop: 24 }}>
        <div className="a-panel-head">
          <h2>بريد استقبال الطلبات</h2>
          <span className="a-sub">إشعارات النماذج فقط — لا يظهر على الموقع</span>
        </div>
        <div className="a-panel-body">
          <p className="a-note" style={{ marginBottom: 14 }}>
            هذا هو البريد الذي تصل إليه إشعارات طلبات عرض السعر وطلبات ملف التأهيل ورسائل التواصل.
            الطلبات تُحفظ في لوحة الإدارة في كل الأحوال حتى لو تعذّر إرسال البريد.
            {notifications.source === "admin"
              ? " المستخدم حالياً: القيمة المحفوظة هنا."
              : notifications.source === "env"
                ? " المستخدم حالياً: البريد المهيّأ في إعدادات الاستضافة."
                : " المستخدم حالياً: البريد الافتراضي."}
          </p>
          {mailNotice && (
            <p className={mailNotice.tone === "ok" ? "a-ok" : "a-error"} role="status" style={{ marginBottom: 14 }}>
              {mailNotice.text}
            </p>
          )}
          <form action={saveNotificationsAction} className="a-form-grid">
            <div className="a-field" data-full="true">
              <label htmlFor="mailTo">البريد المستقبِل للطلبات</label>
              <input
                id="mailTo"
                className="a-input"
                type="email"
                name="mailTo"
                dir="ltr"
                placeholder={notifications.email}
                defaultValue={notifications.source === "admin" ? notifications.email : ""}
              />
              <span className="a-hint">
                اتركه فارغاً للعودة إلى البريد المهيّأ في الاستضافة ({notifications.source === "admin" ? "MAIL_TO" : notifications.email}).
              </span>
            </div>
            <div data-full="true">
              <button type="submit" className="a-btn">
                حفظ بريد الاستقبال
              </button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
