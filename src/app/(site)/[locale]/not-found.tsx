import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section not-found" data-surface="ink" data-surface-section="ink">
      <div className="blueprint-grid" aria-hidden="true" />
      <div className="page not-found-inner">
        <p className="tabular not-found-code">404</p>
        <h1 className="not-found-title">الصفحة غير موجودة · Page not found</h1>
        <p className="not-found-body">
          الرابط الذي طلبته غير متاح. / The page you requested is not available.
        </p>
        <div className="not-found-actions">
          <Link href="/ar" className="btn">
            الرئيسية
          </Link>
          <Link href="/en" className="btn btn-ghost">
            Home
          </Link>
        </div>
      </div>
    </section>
  );
}
