/**
 * Company facts.
 *
 * EVERY value in this file is transcribed from an official document that
 * lives in the project's `Documents/` folder. The `source` comments name it.
 * Do not add a field here unless a document supports it.
 */

export const company = {
  name: {
    ar: "شركة عمران العصر الحديثة للمقاولات",
    en: "Imran Alasr Alhaditha Contracting Company",
  },
  shortName: {
    ar: "عمران العصر الحديثة",
    en: "Imran Alasr Alhaditha",
  },
  /** source: السجل التجاري English.pdf — "Company Limited liability company / (One person)" */
  legalForm: {
    ar: "شركة ذات مسؤولية محدودة — شخص واحد",
    en: "Limited Liability Company — Single Person",
  },
  /** source: ‎عن الشركة.pdf / شهادة الغرفة التجارية.pdf / ملف الأنشطة */
  commercialRegistration: "1009160349",
  /** source: ‎عن الشركة.pdf — تاريخ قيد السجل التجاري */
  crIssueDate: "2024-12-23",
  /** source: ‎عن الشركة.pdf — تاريخ التأكيد السنوي للسجل التجاري */
  crAnnualConfirmation: "2026-12-13",
  /** source: السجل التجاري عربي.pdf — الرقم الوطني الموحد */
  unifiedNationalNumber: "7043094916",
  /** source: ضريبة القيمة المضافة.pdf — رقم التسجيل الضريبي */
  vatNumber: "312731365700003",
  /** source: ضريبة القيمة المضافة.pdf — تاريخ نفاذ التسجيل */
  vatEffectiveDate: "2025-01-01",
  /** source: شهادة الغرفة التجارية.pdf */
  chamber: {
    ar: "الغرفة التجارية الصناعية بالرياض",
    en: "Riyadh Chamber",
    membershipNumber: "1069063",
    class: { ar: "السادسة", en: "Sixth" },
    issueDate: "2024-12-23",
    verifyUrl: "https://mybusiness.chamber.sa",
  },
  contact: {
    /** source: ‎عن الشركة.pdf — البريد الإلكتروني */
    email: "info@imranalasr.sa",
    /** primary line + WhatsApp (provided by the client) */
    phonePrimary: "+966556630202",
    phonePrimaryDisplay: "0556630202",
    /** source: ‎عن الشركة.pdf — رقم الجوال 00966552469717 */
    phoneSecondary: "+966552469717",
    phoneSecondaryDisplay: "0552469717",
    whatsapp: "966556630202",
  },
  /** source: العنوان الوطني.jpg (National Address proof, 26/12/2024) */
  address: {
    shortCode: "REMB6228",
    buildingNumber: "6228",
    street: { ar: "طريق صلاح الدين الأيوبي", en: "Salah Al Din Al Ayoubi Rd" },
    secondaryNumber: "3945",
    district: { ar: "حي الملز", en: "Al Malaz District" },
    postalCode: "12836",
    city: { ar: "الرياض", en: "Riyadh" },
    country: { ar: "المملكة العربية السعودية", en: "Kingdom of Saudi Arabia" },
    countryCode: "SA",
    lines: {
      ar: "طريق صلاح الدين الأيوبي، حي الملز، الرياض 12836، المملكة العربية السعودية",
      en: "Salah Al Din Al Ayoubi Rd, Al Malaz District, Riyadh 12836, Kingdom of Saudi Arabia",
    },
  },
  /** The future production domain. Not connected — see README. */
  futureDomain: "imranalasr.sa",
} as const;

export const workingHours = {
  ar: "الأحد – الخميس · 8:00 ص – 5:00 م",
  en: "Sunday – Thursday · 8:00 – 17:00",
} as const;

export function whatsappLink(text: string) {
  return `https://wa.me/${company.contact.whatsapp}?text=${encodeURIComponent(text)}`;
}
