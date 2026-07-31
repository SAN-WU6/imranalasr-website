import type { Metadata } from "next";
import { localeMeta, type Locale } from "@/i18n/config";

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

/**
 * Every page gets a canonical, both hreflang alternates and an x-default that
 * points at Arabic — the site's primary language, not an afterthought.
 */
export function pageMetadata({
  locale,
  path,
  title,
  description,
  images,
}: {
  locale: Locale;
  /** Path WITHOUT the locale prefix, e.g. "/projects/bisha-project" */
  path: string;
  title: string;
  description: string;
  images?: { url: string; width?: number; height?: number; alt?: string }[];
}): Metadata {
  const clean = path === "/" ? "" : path;
  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}${clean}`,
      languages: { ar: `/ar${clean}`, en: `/en${clean}`, "x-default": `/ar${clean}` },
    },
    openGraph: {
      type: "website",
      title,
      description,
      url: `/${locale}${clean}`,
      locale: localeMeta[locale].ogLocale,
      images: images ?? [{ url: "/og.png", width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description },
  };
}
