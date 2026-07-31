import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageHero from "@/components/PageHero";
import { MaskLines } from "@/components/MaskLines";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, type Locale } from "@/i18n/config";
import { getOverride } from "@/lib/db";
import { pageMetadata } from "@/lib/seo";

/**
 * «قدراتنا» — Capabilities.
 *
 * The structure is ready but the page is HIDDEN by default: it is not linked
 * from any menu, returns 404, and is excluded from the sitemap until the
 * company supplies documented equipment and staffing data. To publish it,
 * set the content override `page:capabilities` to `{ "published": true }`
 * from the admin panel (or directly in the content_overrides table), and add
 * the documented equipment/staff lists below.
 *
 * Deliberately empty of numbers: the brief forbids inventing plant counts,
 * staff counts or capacities that no document supports.
 */

export const dynamic = "force-dynamic";

type CapabilitiesOverride = {
  published?: boolean;
  equipment?: { ar: string[]; en: string[] };
  staffing?: { ar: string[]; en: string[] };
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const flags = await getOverride<CapabilitiesOverride>("page:capabilities");
  if (!flags?.published) return { robots: { index: false, follow: false } };
  const title = locale === "ar" ? "قدراتنا" : "Capabilities";
  return pageMetadata({ locale, path: "/capabilities", title, description: title });
}

export default async function CapabilitiesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  getDictionary(locale); // reserved for when the page gains shared strings

  const data = await getOverride<CapabilitiesOverride>("page:capabilities");
  if (!data?.published) notFound();

  const sections: { title: string; items: string[] }[] = [];
  if (data.equipment?.[locale]?.length) {
    sections.push({ title: locale === "ar" ? "المعدات" : "Equipment", items: data.equipment[locale] });
  }
  if (data.staffing?.[locale]?.length) {
    sections.push({ title: locale === "ar" ? "الكوادر" : "Staffing", items: data.staffing[locale] });
  }

  return (
    <>
      <PageHero
        eyebrow={locale === "ar" ? "قدراتنا" : "Capabilities"}
        title={locale === "ar" ? "قدراتنا" : "Our capabilities"}
        lead={
          locale === "ar"
            ? "المعدات والكوادر الموثقة لدى الشركة."
            : "The company's documented equipment and staffing."
        }
      />
      <section className="section" data-surface-section="light">
        <div className="page">
          {sections.map((s) => (
            <div key={s.title} className="service-block">
              <MaskLines as="h2" className="section-title" lines={[s.title]} />
              <ul className="coverage-list">
                {s.items.map((item, i) => (
                  <li key={item}>
                    <span className="tabular">{String(i + 1).padStart(2, "0")}</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
