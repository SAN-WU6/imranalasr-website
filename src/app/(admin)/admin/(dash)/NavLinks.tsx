"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/admin", label: "نظرة عامة" },
  { href: "/admin/quotes", label: "طلبات عرض السعر" },
  { href: "/admin/profiles", label: "طلبات ملف التأهيل" },
  { href: "/admin/messages", label: "رسائل التواصل" },
  { href: "/admin/content", label: "المحتوى" },
  { href: "/admin/content/home", label: "الصفحة الرئيسية" },
];

export default function NavLinks({ counts }: { counts: Record<string, number> }) {
  const pathname = usePathname();
  // The most specific match wins, so /admin/content/home does not also light up
  // the /admin/content entry.
  const current = ITEMS.filter((i) => (i.href === "/admin" ? pathname === "/admin" : pathname.startsWith(i.href)))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  return (
    <nav aria-label="أقسام لوحة الإدارة">
      <ul>
        {ITEMS.map((i) => {
          const active = i.href === current;
          const n = counts[i.href] ?? 0;
          return (
            <li key={i.href}>
              <Link href={i.href} data-active={active}>
                <span>{i.label}</span>
                {n > 0 ? <span className="a-side-badge tabular">{n}</span> : null}
              </Link>
            </li>
          );
        })}
        <li>
          <Link href="/ar" target="_blank">
            <span>عرض الموقع ↗</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}
