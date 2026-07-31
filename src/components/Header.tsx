"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { href, otherLocale, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

type Item = { path: string; label: string };

export default function Header({ locale, t }: { locale: Locale; t: Dictionary }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [condensed, setCondensed] = useState(false);
  const [surface, setSurface] = useState<"light" | "ink">("ink");
  const headerRef = useRef<HTMLElement>(null);

  const items: Item[] = [
    { path: "/about", label: t.nav.about },
    { path: "/services", label: t.nav.services },
    { path: "/projects", label: t.nav.projects },
    { path: "/quality", label: t.nav.quality },
    { path: "/contact", label: t.nav.contact },
  ];

  /* Header theme follows whichever section sits beneath it. */
  useEffect(() => {
    let raf = 0;
    const measure = () => {
      raf = 0;
      const probe = (headerRef.current?.offsetHeight ?? 72) * 0.6;
      const sections = document.querySelectorAll<HTMLElement>("[data-surface-section]");
      let current: "light" | "ink" = "light";
      for (const s of sections) {
        const r = s.getBoundingClientRect();
        if (r.top <= probe && r.bottom > probe) {
          const kind = s.dataset.surfaceSection;
          current = kind === "ink" || kind === "teal" ? "ink" : "light";
        }
      }
      setSurface(current);
      setCondensed(window.scrollY > 24);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname]);

  /* Close the overlay on navigation, and lock the page behind it. */
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.documentElement.classList.toggle("lenis-stopped", open);
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.classList.remove("lenis-stopped");
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const other = otherLocale(locale);
  const restOfPath = pathname.replace(/^\/(ar|en)/, "") || "";
  const isActive = (p: string) => pathname === href(p, locale) || pathname.startsWith(`${href(p, locale)}/`);

  return (
    <>
      <a className="skip-link" href="#main">
        {t.nav.skipToContent}
      </a>

      <header
        ref={headerRef}
        className="site-header"
        data-condensed={condensed}
        data-tone={open ? "ink" : surface}
        data-open={open}
      >
        <div className="page site-header-inner">
          <Link href={href("/", locale)} className="brand" aria-label={t.meta.siteName}>
            <Image src="/brand/mark.png" alt="" width={40} height={48} className="brand-mark" priority />
            <span className="brand-text">
              <span className="brand-ar">{locale === "ar" ? "عمران العصر الحديثة" : "Imran Alasr Alhaditha"}</span>
              <span className="brand-sub">{locale === "ar" ? "للمقاولات" : "Contracting Company"}</span>
            </span>
          </Link>

          <nav className="site-nav" aria-label={t.nav.menu}>
            {items.map((i) => (
              <Link key={i.path} href={href(i.path, locale)} className="site-nav-link" data-active={isActive(i.path)}>
                {i.label}
              </Link>
            ))}
          </nav>

          <div className="site-header-actions">
            <Link
              href={`/${other}${restOfPath}`}
              className="lang-switch"
              hrefLang={other}
              aria-label={t.common.switchToEnglish}
            >
              {t.common.languageSwitch}
            </Link>
            <Link href={href("/quote", locale)} className="btn header-cta">
              {t.common.requestQuote}
            </Link>
            <button
              type="button"
              className="menu-toggle"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
            >
              <span className="sr-only">{open ? t.nav.close : t.nav.menu}</span>
              <span className="menu-bars" aria-hidden="true">
                <i />
                <i />
              </span>
            </button>
          </div>
        </div>
        <span className="site-header-rule" aria-hidden="true" />
      </header>

      <div id="mobile-menu" className="mobile-menu" data-open={open} data-surface="ink" hidden={!open}>
        <div className="page mobile-menu-inner">
          <nav aria-label={t.nav.menu}>
            <ol>
              {[{ path: "/", label: t.nav.home }, ...items].map((i, n) => (
                <li key={i.path} style={{ ["--i" as string]: n }}>
                  <Link href={href(i.path, locale)}>
                    <span className="tabular mobile-menu-index">{String(n + 1).padStart(2, "0")}</span>
                    {i.label}
                  </Link>
                </li>
              ))}
            </ol>
          </nav>
          <div className="mobile-menu-foot">
            <Link href={href("/quote", locale)} className="btn">
              {t.common.requestQuote}
            </Link>
            <Link href={`/${other}${restOfPath}`} className="btn btn-ghost" hrefLang={other}>
              {t.common.languageSwitch}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
