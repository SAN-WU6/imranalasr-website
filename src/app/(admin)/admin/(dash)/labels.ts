export const STATUS_LABEL: Record<string, string> = {
  new: "جديد",
  in_review: "قيد المراجعة",
  contacted: "تم التواصل",
  quoted: "أُرسل العرض",
  won: "مرحّل للتنفيذ",
  closed: "مغلق",
  approved: "معتمد",
  rejected: "مرفوض",
};

export const PROJECT_TYPE_LABEL: Record<string, string> = {
  buildings: "مبانٍ سكنية أو غير سكنية",
  restoration: "ترميم وتشطيب وديكور",
  roads: "طرق وأرصفة",
  power: "أعمال كهربائية ومحطات طاقة",
  telecom: "اتصالات وشبكات وأنظمة منخفضة التيار",
  structural: "أعمال إنشائية مساندة",
  other: "أخرى",
};

export const DURATION_LABEL: Record<string, string> = {
  lt3: "أقل من 3 أشهر",
  m3_6: "3 – 6 أشهر",
  m6_12: "6 – 12 شهراً",
  gt12: "أكثر من 12 شهراً",
  unknown: "غير محدد",
};

export const START_LABEL: Record<string, string> = {
  immediate: "فوري",
  within1m: "خلال شهر",
  within3m: "خلال 3 أشهر",
  later: "لاحقاً",
  unknown: "غير محدد",
};

export const CONTACT_LABEL: Record<string, string> = {
  phone: "اتصال هاتفي",
  whatsapp: "واتساب",
  email: "بريد إلكتروني",
};
