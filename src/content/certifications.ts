/**
 * Certifications & registrations.
 *
 * Transcribed from the certificates in Documents/. `verifyUrl` is only set
 * where the certificate itself prints an official verification address.
 * The certificate documents themselves are deliberately NOT published on the
 * site — only their data is used to build these cards.
 */

import type { LocalizedText } from "./projects";

export type Credential = {
  id: string;
  kind: "iso" | "registration" | "membership" | "tax";
  code: LocalizedText;
  title: LocalizedText;
  issuer: LocalizedText;
  /** Rendered as a definition list. Only documented values appear. */
  facts: { label: LocalizedText; value: string }[];
  scope?: LocalizedText;
  accreditation?: LocalizedText;
  verifyUrl?: string;
  validFrom?: string;
  validTo?: string;
};

const gcpl: LocalizedText = { ar: "Globus Certifications Private Limited (GCPL)", en: "Globus Certifications Private Limited (GCPL)" };
const uaf: LocalizedText = {
  ar: "معتمدة من United Accreditation Foundation Inc. (UAF)",
  en: "Accredited by United Accreditation Foundation Inc. (UAF)",
};
const isoScope: LocalizedText = {
  ar: "المقاولات العامة لإنشاء وتركيب وإعادة تشكيل وتجديد المباني السكنية وغير السكنية، بما في ذلك المنشآت الجاهزة.",
  en: "General Contracting for the Construction, Erection, Remodelling, and Renovation of Residential and Non-Residential Buildings, including Prefabricated Structures.",
};

const L = {
  regNo: { ar: "رقم التسجيل", en: "Registration No." },
  certNo: { ar: "رقم الشهادة", en: "Certificate No." },
  issued: { ar: "تاريخ الإصدار", en: "Issue date" },
  validity: { ar: "فترة السريان", en: "Valid period" },
  membershipNo: { ar: "رقم العضوية", en: "Membership No." },
  membershipClass: { ar: "درجة العضوية", en: "Membership class" },
  crNo: { ar: "رقم السجل التجاري", en: "Commercial register No." },
  unified: { ar: "الرقم الوطني الموحد", en: "Unified national number" },
  vatNo: { ar: "رقم التسجيل الضريبي", en: "VAT registration No." },
  effective: { ar: "تاريخ النفاذ", en: "Effective date" },
  period: { ar: "الفترة الضريبية", en: "Tax period" },
  entity: { ar: "نوع الكيان", en: "Entity type" },
};

export const credentials: Credential[] = [
  {
    id: "iso-9001",
    kind: "iso",
    code: { ar: "ISO 9001:2015", en: "ISO 9001:2015" },
    title: { ar: "نظام إدارة الجودة", en: "Quality Management System" },
    issuer: gcpl,
    facts: [
      { label: L.regNo, value: "AB2602XXIII07-0001" },
      { label: L.certNo, value: "CB-MS-1713" },
      { label: L.issued, value: "2026-07-23" },
      { label: L.validity, value: "2026-07-23 → 2029-07-22" },
    ],
    scope: isoScope,
    accreditation: uaf,
    verifyUrl: "https://www.gcert.co",
    validFrom: "2026-07-23",
    validTo: "2029-07-22",
  },
  {
    id: "iso-14001",
    kind: "iso",
    code: { ar: "ISO 14001:2015", en: "ISO 14001:2015" },
    title: { ar: "نظام الإدارة البيئية", en: "Environmental Management System" },
    issuer: gcpl,
    facts: [
      { label: L.regNo, value: "CD2602XXIII07-0002" },
      { label: L.certNo, value: "CB-MS-1712" },
      { label: L.issued, value: "2026-07-23" },
      { label: L.validity, value: "2026-07-23 → 2029-07-22" },
    ],
    scope: isoScope,
    accreditation: uaf,
    verifyUrl: "https://www.gcert.co",
    validFrom: "2026-07-23",
    validTo: "2029-07-22",
  },
  {
    id: "iso-45001",
    kind: "iso",
    code: { ar: "ISO 45001:2018", en: "ISO 45001:2018" },
    title: { ar: "نظام إدارة الصحة والسلامة المهنية", en: "Occupational Health & Safety Management System" },
    issuer: gcpl,
    facts: [
      { label: L.regNo, value: "EF2602XXIII07-0003" },
      { label: L.certNo, value: "CB-MS-1720" },
      { label: L.issued, value: "2026-07-23" },
      { label: L.validity, value: "2026-07-23 → 2029-07-22" },
    ],
    scope: isoScope,
    accreditation: uaf,
    verifyUrl: "https://www.gcert.co",
    validFrom: "2026-07-23",
    validTo: "2029-07-22",
  },
  {
    id: "commercial-register",
    kind: "registration",
    code: { ar: "السجل التجاري", en: "Commercial Register" },
    title: { ar: "شهادة السجل التجاري", en: "Commercial Registration Certificate" },
    issuer: { ar: "وزارة التجارة", en: "Ministry of Commerce" },
    facts: [
      { label: L.crNo, value: "1009160349" },
      { label: L.unified, value: "7043094916" },
      { label: L.issued, value: "2024-12-23" },
      { label: L.entity, value: "شركة ذات مسؤولية محدودة — شخص واحد" },
    ],
    verifyUrl: "https://mc.gov.sa",
  },
  {
    id: "chamber-membership",
    kind: "membership",
    code: { ar: "الغرفة التجارية", en: "Chamber of Commerce" },
    title: { ar: "عضوية الغرفة التجارية الصناعية بالرياض", en: "Riyadh Chamber Membership" },
    issuer: { ar: "الغرفة التجارية الصناعية بالرياض", en: "Riyadh Chamber of Commerce & Industry" },
    facts: [
      { label: L.membershipNo, value: "1069063" },
      { label: L.membershipClass, value: "السادسة / Sixth" },
      { label: L.issued, value: "2024-12-23" },
    ],
    verifyUrl: "https://mybusiness.chamber.sa",
  },
  {
    id: "vat",
    kind: "tax",
    code: { ar: "ضريبة القيمة المضافة", en: "VAT" },
    title: { ar: "شهادة التسجيل في ضريبة القيمة المضافة", en: "VAT Registration Certificate" },
    issuer: { ar: "هيئة الزكاة والضريبة والجمارك", en: "Zakat, Tax and Customs Authority" },
    facts: [
      { label: L.vatNo, value: "312731365700003" },
      { label: L.effective, value: "2025-01-01" },
      { label: L.period, value: "ربع سنوي / Quarterly" },
    ],
    verifyUrl: "https://zatca.gov.sa",
  },
];

export const isoCredentials = credentials.filter((c) => c.kind === "iso");
