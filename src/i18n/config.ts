export const locales = ["ar", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "ar";

export const localeMeta: Record<Locale, { dir: "rtl" | "ltr"; label: string; htmlLang: string; ogLocale: string }> = {
  ar: { dir: "rtl", label: "العربية", htmlLang: "ar-SA", ogLocale: "ar_SA" },
  en: { dir: "ltr", label: "English", htmlLang: "en", ogLocale: "en_US" },
};

export function isLocale(v: string): v is Locale {
  return (locales as readonly string[]).includes(v);
}

export function otherLocale(l: Locale): Locale {
  return l === "ar" ? "en" : "ar";
}

/** Localised path helper: href("/projects", "ar") → "/ar/projects" */
export function href(path: string, locale: Locale) {
  const p = path === "/" ? "" : path;
  return `/${locale}${p}`;
}
