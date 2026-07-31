import Image from "next/image";
import { redirect } from "next/navigation";
import { currentAdmin } from "@/lib/auth";
import { countByStatus, driver } from "@/lib/db";
import { logoutAction } from "../actions";
import NavLinks from "./NavLinks";

export const dynamic = "force-dynamic";

export default async function DashLayout({ children }: { children: React.ReactNode }) {
  const email = await currentAdmin();
  if (!email) redirect("/admin/login");

  const [quotes, profiles, messages] = await Promise.all([
    countByStatus("quote_requests"),
    countByStatus("profile_requests"),
    countByStatus("contact_messages"),
  ]);

  const counts = {
    "/admin/quotes": quotes.new ?? 0,
    "/admin/profiles": profiles.new ?? 0,
    "/admin/messages": messages.new ?? 0,
  };

  return (
    <div className="a-shell">
      <aside className="a-side">
        <div className="a-side-brand">
          <Image src="/brand/mark-white.png" alt="" width={28} height={34} />
          <span>لوحة الإدارة</span>
        </div>

        <NavLinks counts={counts} />

        <div className="a-side-foot">
          <p>{email}</p>
          <p>قاعدة البيانات: {driver === "supabase" ? "Supabase" : "SQLite"}</p>
          <form action={logoutAction}>
            <button type="submit" className="a-btn a-btn-ghost" style={{ color: "#fff", borderColor: "rgba(255,255,255,.3)" }}>
              تسجيل الخروج
            </button>
          </form>
        </div>
      </aside>

      <main className="a-main">{children}</main>
    </div>
  );
}
