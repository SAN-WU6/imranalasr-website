/**
 * Services.
 *
 * The `activities` arrays are a verbatim transcription of the company's
 * official activity file (Documents/ملف الأنشطة عمران العصر الحديث.pdf,
 * Ministry of Commerce, dated 1446/06/22 H), including the ISIC-style code.
 * All 19 registered activities appear exactly once across the six groups.
 * No activity has been added, reworded in a way that widens its meaning,
 * or implied.
 */

export type Activity = {
  code: string;
  ar: string;
  en: string;
  /** Note printed on the official file: this activity needs a separate licence. */
  licenceNote?: { ar: string; en: string };
};

export type Service = {
  slug: string;
  index: string;
  title: { ar: string; en: string };
  lead: { ar: string; en: string };
  activities: Activity[];
};

export const services: Service[] = [
  {
    slug: "building-construction",
    index: "01",
    title: { ar: "إنشاء المباني", en: "Building Construction" },
    lead: {
      ar: "تنفيذ المباني السكنية وغير السكنية والمباني الجاهزة في المواقع، ضمن نطاق الأنشطة المسجلة في السجل التجاري.",
      en: "Delivery of residential, non-residential and site-assembled prefabricated buildings, within the activities registered on the commercial register.",
    },
    activities: [
      { code: "410010", ar: "الإنشاءات العامة للمباني السكنية", en: "General construction of residential buildings" },
      {
        code: "410021",
        ar: "الإنشاءات العامة للمباني غير السكنية (مثل المدارس والمستشفيات والفنادق … إلخ)",
        en: "General construction of non-residential buildings (schools, hospitals, hotels, etc.)",
        licenceNote: {
          ar: "النشاط يتطلب الحصول على ترخيص من وزارة الشؤون البلدية والقروية والإسكان.",
          en: "This activity requires a licence from the Ministry of Municipal, Rural Affairs and Housing.",
        },
      },
      { code: "410030", ar: "إنشاءات المباني الجاهزة في المواقع", en: "Erection of prefabricated buildings on site" },
    ],
  },
  {
    slug: "restoration-finishing",
    index: "02",
    title: { ar: "الترميم والتشطيب والديكور", en: "Restoration, Finishing & Interiors" },
    lead: {
      ar: "ترميم المباني القائمة وأعمال التشطيب الداخلي والخارجي وتنفيذ الديكورات، بمستوى إنهاء يقبل التسليم للجهات المشغّلة.",
      en: "Restoration of existing buildings, internal and external finishing, and interior fit-out delivered to hand-over standard.",
    },
    activities: [
      { code: "410040", ar: "ترميمات المباني السكنية وغير السكنية", en: "Restoration of residential and non-residential buildings" },
      { code: "433010", ar: "تشطيب المباني", en: "Building finishing works" },
      { code: "433061", ar: "أعمال وتركيب الديكورات المختلفة", en: "Interior decoration works and installation" },
    ],
  },
  {
    slug: "roads-pavements",
    index: "03",
    title: { ar: "أعمال الطرق والأرصفة", en: "Roads & Pavements" },
    lead: {
      ar: "إصلاح وصيانة الطرق والشوارع والأرصفة ومستلزماتها، بما يشمل أعمال الطبقات والتسوية والدمك داخل المواقع.",
      en: "Repair and maintenance of roads, streets, pavements and their accessories, including sub-base, grading and compaction works on site.",
    },
    activities: [
      {
        code: "421051",
        ar: "إصلاح وصيانة الطرق والشوارع والأرصفة ومستلزمات الطرق",
        en: "Repair and maintenance of roads, streets, pavements and road accessories",
      },
    ],
  },
  {
    slug: "electrical-power",
    index: "04",
    title: { ar: "الأعمال الكهربائية والطاقة", en: "Electrical & Power Works" },
    lead: {
      ar: "إنشاء وإقامة محطات الطاقة الكهربائية والمحولات، وتمديد الأسلاك الكهربائية وتركيب أنظمة الإضاءة.",
      en: "Construction and erection of electrical power stations and transformers, electrical cabling, and lighting systems installation.",
    },
    activities: [
      { code: "422060", ar: "إنشاء وإقامة محطات الطاقة الكهربائية والمحولات", en: "Construction and erection of electrical power stations and transformers" },
      { code: "432111", ar: "تمديد الأسلاك الكهربائية", en: "Electrical wiring installation" },
      { code: "432131", ar: "تركيب أنظمة الإضاءة", en: "Lighting systems installation" },
    ],
  },
  {
    slug: "telecom-low-current",
    index: "05",
    title: { ar: "الاتصالات والشبكات والأنظمة منخفضة التيار", en: "Telecom, Networks & Low-Current Systems" },
    lead: {
      ar: "تمديد أسلاك الاتصالات والشبكات، وتركيب شبكات الحاسب والتلفزيون والستلايت، وأنظمة الإنذار من الحريق.",
      en: "Telecom and network cabling, computer / TV / satellite network installation, and fire alarm systems.",
    },
    activities: [
      { code: "432112", ar: "تمديد أسلاك الاتصالات", en: "Telecommunication cabling" },
      { code: "432113", ar: "تمديدات الشبكات", en: "Network cabling" },
      { code: "432121", ar: "تركيب وتمديد شبكات التلفزيون والستلايت", en: "Installation and extension of TV and satellite networks" },
      { code: "432122", ar: "تركيب وتمديد شبكات الكمبيوتر والاتصالات", en: "Installation and extension of computer and telecom networks" },
      {
        code: "432132",
        ar: "تركيب وصيانة أجهزة ومعدات الإنذار من الحريق",
        en: "Installation and maintenance of fire alarm devices and equipment",
        licenceNote: {
          ar: "النشاط يتطلب الحصول على ترخيص من الهيئة العليا للأمن الصناعي.",
          en: "This activity requires a licence from the High Commission for Industrial Security.",
        },
      },
    ],
  },
  {
    slug: "structural-support",
    index: "06",
    title: { ar: "الأعمال الإنشائية المساندة", en: "Supporting Structural Works" },
    lead: {
      ar: "أعمال الهدم والإزالة، وصب القواعد والأساسات، وتركيب السقالات، والوحدات المسبقة الشد لإجهادات الخرسانة.",
      en: "Demolition and removal, casting of footings and foundations, scaffolding erection, and post-tensioned concrete units.",
    },
    activities: [
      { code: "431101", ar: "هدم وإزالة المباني وغيرها", en: "Demolition and removal of buildings and other structures" },
      { code: "431220", ar: "صب القواعد والأساسات", en: "Casting of footings and foundations" },
      { code: "439020", ar: "أعمال تركيب السقالات", en: "Scaffolding erection works" },
      {
        code: "439061",
        ar: "تركيب وصيانة الوحدات المسبقة الشد لإجهادات الخرسانة",
        en: "Installation and maintenance of pre-stressed units for concrete stressing",
      },
    ],
  },
];

export const totalRegisteredActivities = services.reduce((n, s) => n + s.activities.length, 0); // 19

export function getService(slug: string) {
  return services.find((s) => s.slug === slug);
}
