/**
 * Projects.
 *
 * These are the real project folders supplied with the brief. Only two things
 * are asserted as fact: the project name (from the folder name) and the region
 * it names. Client, contract value, dates, duration and completion
 * percentage are NOT in any supplied document, so those fields do not exist
 * here and are not rendered anywhere.
 *
 * `documented` lists work that is visible in the project's own photographs —
 * it is described as "what the photographs document", never as a contractual
 * scope of work.
 *
 * `relatedServices` links to services.ts by slug. It is a navigational link to
 * the company's registered activities, not a claim about this project.
 */

import media from "./media.json";

export type LocalizedText = { ar: string; en: string };

export type ProjectImage = { src: string; w: number; h: number; blur: string; alt: LocalizedText };

/**
 * One photograph selected for the home projects scene. Flat and caption-free:
 * the scene already holds the projects, so it looks the caption up by slug
 * instead of shipping every project twice.
 */
export type ShowcaseTile = { src: string; w: number; h: number; blur: string; slug: string };

export type Project = {
  slug: string;
  order: number;
  published: boolean;
  /** Verbatim from the supplied folder name. */
  sourceFolder: string;
  title: LocalizedText;
  /** Short label used in tight layouts. */
  shortTitle: LocalizedText;
  location: LocalizedText;
  /** Neutral restatement of the project name. Adds no facts. */
  summary: LocalizedText;
  /** Observable from the project's own photographs. */
  documented: { ar: string[]; en: string[] };
  relatedServices: string[];
  seo: { title: LocalizedText; description: LocalizedText };
  cover: ProjectImage;
  coverPortrait: ProjectImage;
  gallery: ProjectImage[];
};

type MediaEntry = {
  cover: { src: string; w: number; h: number; blur: string };
  coverPortrait: { src: string; w: number; h: number; blur: string };
  gallery: { src: string; w: number; h: number; blur: string }[];
};
const M = media as unknown as Record<string, MediaEntry>;

function build(slug: string, alts: LocalizedText[], coverAlt: LocalizedText) {
  const m = M[slug];
  return {
    cover: { ...m.cover, alt: coverAlt },
    coverPortrait: { ...m.coverPortrait, alt: coverAlt },
    gallery: m.gallery.map((g, i) => ({ ...g, alt: alts[i] ?? coverAlt })),
  };
}

const asirAlts: LocalizedText[] = [
  { ar: "لوح جداري كبير مثبت رأسياً ومربوط بأحزمة أمام واجهة غرفة التحكم", en: "Large wall panel standing vertically and strapped in front of the control room facade" },
  { ar: "فني يرتدي معدات الوقاية أثناء تثبيت لوح جداري بمساعدة سلّم", en: "Technician in full PPE fixing a wall panel from a ladder" },
  { ar: "لوح معدني مركّب على قاعدة خرسانية بجانب جدار الغرفة", en: "Metal panel seated on a concrete plinth beside the room wall" },
  { ar: "عامل يحمل لوحاً معدنياً إلى موضع التركيب", en: "Worker carrying a metal panel to its installation position" },
  { ar: "عاملان يثبّتان لوحاً جدارياً بمحاذاة الهيكل", en: "Two workers aligning a wall panel against the structure" },
  { ar: "لوح جداري كبير في وضعه النهائي داخل حيّز غرفة التحكم", en: "Large wall panel in its final position inside the control room bay" },
  { ar: "لوح مركّب على إطار معدني مثبت بقاعدة خرسانية", en: "Panel mounted on a steel frame fixed to a concrete base" },
  { ar: "لوح جداري موضوع على قاعدة معدنية قبل الرفع", en: "Wall panel resting on a steel cradle before lifting" },
  { ar: "منصة معدنية مجلفنة مركّبة فوق الحيّز", en: "Galvanised steel platform installed over the bay" },
  { ar: "إطار معدني أفقي مثبّت على قواعد خرسانية", en: "Horizontal steel frame fixed onto concrete pads" },
  { ar: "إطار قاعدة معدني مثبّت أسفل الجدار", en: "Steel base frame fixed beneath the wall line" },
  { ar: "امتداد الإطار المعدني على طول قاعدة الغرفة", en: "Steel frame running along the full base of the room" },
  { ar: "عاملان بجوار قالب معدني وفتحة أرضية أثناء التنفيذ", en: "Two workers beside a steel form and a floor opening during works" },
  { ar: "فتحة أرضية خرسانية تظهر التمديدات قبل الإغلاق", en: "Concrete floor opening exposing services before closing" },
  { ar: "ميزان استواء موضوع على حامل معدني للتحقق من المنسوب", en: "Spirit level set on a steel stand to verify levels" },
  { ar: "فني يرتدي معدات الوقاية الكاملة في موقع العمل", en: "Technician in full protective equipment on site" },
  { ar: "الحيّز المهيّأ مع الحواجز وطفايات الحريق أثناء التنفيذ", en: "Work bay prepared with barriers and fire extinguishers during execution" },
  { ar: "إطار القاعدة المعدني مثبّت ومسنود قبل تركيب الجدار", en: "Steel base frame fixed and propped before wall installation" },
];

const jazanWarehouseAlts: LocalizedText[] = [
  { ar: "داخل المستودع بعد اكتمال الأرضية وتركيب الرفوف المعدنية", en: "Warehouse interior with the floor complete and steel racking installed" },
  { ar: "صف الرفوف الممتد على طول جدار المستودع", en: "Racking run extending along the warehouse wall" },
  { ar: "المستودع من زاوية المدخل مع الرفوف والسلّم", en: "Warehouse seen from the entrance with racking and access ladder" },
  { ar: "مساحة التخزين الداخلية بعد التشطيب", en: "Internal storage volume after finishing" },
  { ar: "الرفوف المعدنية والمداخل الداخلية", en: "Steel racking and internal doorways" },
  { ar: "الأرضية المصقولة وجدران المستودع بعد الطلاء", en: "Polished floor and painted warehouse walls" },
  { ar: "رفوف زاويّة مركّبة على جدارين متعامدين", en: "Corner racking installed against two perpendicular walls" },
  { ar: "الأرضية الإيبوكسية بعد الإنهاء", en: "Epoxy floor after completion" },
  { ar: "منطقة مؤشّرة بخطوط صفراء على أرضية المستودع", en: "Area marked with yellow lines on the warehouse floor" },
  { ar: "الواجهة الخارجية للمستودع أثناء أعمال المعالجة", en: "External warehouse elevation during treatment works" },
  { ar: "تركيب وحدة تكييف على الجدار الخارجي", en: "Air-conditioning unit being installed on the external wall" },
  { ar: "واجهة المستودع الخارجية ليلاً", en: "External warehouse elevation at night" },
];

const jazanWallAlts: LocalizedText[] = [
  { ar: "جدار الحماية الخرساني محاطاً بالسقالات أثناء العمل الليلي", en: "Concrete protection wall enclosed in scaffolding during night works" },
  { ar: "واجهة الجدار بالكامل تحت الإضاءة الليلية للموقع", en: "Full wall elevation under site lighting at night" },
  { ar: "جدار الحماية من الجهة المقابلة مع شبكات الأمان", en: "Protection wall from the opposite side with safety netting" },
  { ar: "الجدار الخرساني بجوار المحوّل بعد فك جزء من السقالات", en: "Concrete wall beside the transformer after partial scaffold removal" },
  { ar: "رافعة تخدم أعمال السقالات في الموقع", en: "Crane serving scaffolding operations on site" },
  { ar: "هيكل السقالات المحيط بالجدار نهاراً", en: "Scaffold structure surrounding the wall in daylight" },
  { ar: "الموقع من زاوية واسعة تُظهر الجدار والسقالات", en: "Wide view of the site showing the wall and scaffolding" },
  { ar: "سطح الجدار الخرساني بعد الفك", en: "Concrete wall face after striking the formwork" },
  { ar: "سطح خرساني منجز مع الحواف المعالجة", en: "Completed concrete surface with treated edges" },
  { ar: "الجدار الخرساني بعد الصب أثناء أعمال الردم", en: "Concrete wall after casting during backfill works" },
  { ar: "مدحلة تعمل على دمك التربة أمام الجدار", en: "Roller compacting the ground in front of the wall" },
  { ar: "واجهة الجدار الخرساني مع السقالات والمحوّل", en: "Concrete wall elevation with scaffolding and transformer" },
  { ar: "أعمال العزل والردم بجانب القاعدة الخرسانية", en: "Waterproofing and backfill works alongside the concrete base" },
  { ar: "أعمال الحفر والعزل حول القواعد ليلاً", en: "Excavation and waterproofing around the foundations at night" },
  { ar: "عامل على منصة العمل بجوار الجدار", en: "Worker on the platform beside the wall" },
  { ar: "تفصيل قاعدة معدنية مثبتة على الخرسانة", en: "Detail of a steel base fixed onto concrete" },
];

const bishaAlts: LocalizedText[] = [
  { ar: "الهيكل الخرساني محاطاً بالسقالات تحت إضاءة الموقع الليلية", en: "Concrete structure enclosed in scaffolding under night site lighting" },
  { ar: "واجهة المبنى قيد التنفيذ ليلاً من زاوية واسعة", en: "Wide night view of the building under construction" },
  { ar: "الهيكل نهاراً مع السقالات الكاملة", en: "The structure in daylight with full scaffolding" },
  { ar: "طوابق السقالات الممتدة على واجهة المبنى", en: "Scaffold lifts running across the building elevation" },
  { ar: "السقالات والقوالب على الواجهة الجانبية", en: "Scaffolding and formwork on the side elevation" },
  { ar: "الهيكل ليلاً من الجهة الخلفية", en: "The structure at night from the rear" },
  { ar: "الواجهة المقابلة أثناء العمل الليلي", en: "Opposite elevation during night works" },
  { ar: "الهيكل الخرساني والقوالب المعدنية", en: "Concrete structure and steel formwork" },
  { ar: "عمّال على ممر معدني في الموقع", en: "Workers on a steel walkway on site" },
  { ar: "قوالب خشبية وحديد تسليح لقاعدة خرسانية", en: "Timber formwork and reinforcement for a concrete base" },
  { ar: "أعمال القواعد والعزل عند حدود المبنى", en: "Foundation and waterproofing works at the building perimeter" },
  { ar: "عامل يسوّي الخرسانة الطرية بمسطرة خشبية داخل مجرى القاعدة", en: "A worker levelling freshly placed concrete with a timber screed inside the foundation trench" },
  { ar: "قوالب رأسية وحديد تسليح لجدار خرساني", en: "Vertical formwork and reinforcement for a concrete wall" },
  { ar: "عمّال ينفذون أعمال الصب داخل الحيّز", en: "Workers carrying out casting works inside the bay" },
  { ar: "أعمال العزل والتغطية داخل المجرى الخرساني", en: "Waterproofing and covering works inside the concrete trench" },
  { ar: "أعمال داخلية عند مجرى خرساني مع التمديدات", en: "Internal works at a concrete trench with services" },
  { ar: "سقالات وقوالب سقف من الأسفل", en: "Scaffolding and soffit formwork seen from below" },
  { ar: "عيّنات مكعبات خرسانية للفحص في الموقع", en: "Concrete cube samples prepared for testing on site" },
];

const sharurahAlts: LocalizedText[] = [
  { ar: "محوّل قدرة على مقطورة هيدروليكية متعددة المحاور داخل الموقع", en: "Power transformer on a multi-axle hydraulic trailer inside the site" },
  { ar: "حفر القاعدة الخرسانية ومجاري الكابلات قبل الصب", en: "Excavation of the concrete base and cable trenches before casting" },
  { ar: "عوازل المحوّل الطرفية ومنظومة التبريد من مسافة قريبة", en: "The transformer's bushings and cooling assembly at close range" },
  { ar: "جسم المحوّل مربوطاً بالسلاسل فوق منصة النقل", en: "The transformer body chained down on the transport platform" },
  { ar: "امتداد مجاري الكابلات وأعمال البلوك حول القاعدة", en: "Cable trenches and blockwork extending around the base" },
  { ar: "المحوّل أثناء نقله داخل حرم المحطة", en: "The transformer being moved inside the substation compound" },
  { ar: "المحوّل مستنداً على دعائم خشبية مؤقتة في الموقع", en: "The transformer resting on temporary timber cribbing on site" },
  { ar: "أعمال الحفر والقواعد بمحاذاة مباني المحطة", en: "Excavation and foundation works alongside the station buildings" },
  { ar: "مشعاعات التبريد وصناديق المعدات بجوار المحوّل", en: "Cooling radiators and equipment crates beside the transformer" },
  { ar: "فني يرتدي بدلة السلامة أثناء تأمين الحمولة", en: "Technician in safety coveralls securing the load" },
  { ar: "ساحة المحطة بعد تجهيز موضع القاعدة", en: "The station yard with the base position prepared" },
  { ar: "شاحنة النقل الثقيل عند مدخل الموقع", en: "The heavy transport truck at the site entrance" },
  { ar: "تفصيل العوازل الطرفية من زاوية أخرى", en: "Detail of the bushings from another angle" },
  { ar: "المحوّل ومجموعة التبريد على المقطورة", en: "The transformer and its cooling bank on the trailer" },
  { ar: "قافلة النقل داخل حرم المحطة", en: "The transport convoy inside the compound" },
  { ar: "المحوّل في ساحة المحطة قبل التركيب", en: "The transformer in the station yard before installation" },
  { ar: "المحوّل على المقطورة المنخفضة أثناء المناورة", en: "The transformer on the low-loader during manoeuvring" },
  { ar: "رأس الشاحنة والمقطورة المحمّلة في الموقع", en: "The tractor unit and loaded trailer on site" },
];

export const projects: Project[] = [
  {
    slug: "sharurah-transformer-base",
    order: 1,
    published: true,
    sourceFolder: "إنشاء قاعدة محول شرورة",
    title: { ar: "إنشاء قاعدة محوّل — شرورة", en: "Transformer Foundation — Sharurah" },
    shortTitle: { ar: "قاعدة محوّل شرورة", en: "Sharurah Transformer Base" },
    location: { ar: "شرورة", en: "Sharurah" },
    summary: {
      ar: "إنشاء قاعدة محوّل في شرورة. تُظهر صور الموقع أعمال حفر وقواعد ومجاري كابلات داخل محطة قائمة، إلى جانب استقبال محوّل القدرة ومنظومة تبريده ونقله على مقطورة هيدروليكية متعددة المحاور.",
      en: "Construction of a transformer foundation in Sharurah. The site photographs show excavation, foundation and cable-trench works inside an operating station, alongside the receipt of the power transformer and its cooling assembly and its movement on a multi-axle hydraulic trailer.",
    },
    documented: {
      ar: [
        "حفر قاعدة المحوّل وتجهيز موضعها داخل المحطة",
        "تنفيذ مجاري كابلات وأعمال بلوك حول القاعدة",
        "استقبال محوّل قدرة ومشعاعات التبريد في الموقع",
        "نقل المحوّل على مقطورة هيدروليكية متعددة المحاور",
        "إسناد المحوّل على دعائم خشبية ومعدنية مؤقتة",
        "تأمين الحمولة بالسلاسل وأعمال المناورة داخل حرم المحطة",
      ],
      en: [
        "Excavation of the transformer base and preparation of its position inside the station",
        "Cable trenches and blockwork executed around the base",
        "Power transformer and cooling radiators received on site",
        "Transformer moved on a multi-axle hydraulic trailer",
        "Transformer supported on temporary timber and steel cribbing",
        "Load secured with chains and manoeuvred inside the compound",
      ],
    },
    relatedServices: ["electrical-power", "structural-support"],
    seo: {
      title: { ar: "إنشاء قاعدة محوّل — شرورة", en: "Transformer Foundation — Sharurah" },
      description: {
        ar: "إنشاء قاعدة محوّل في شرورة — أعمال حفر وقواعد ومجاري كابلات، واستقبال محوّل القدرة ونقله داخل المحطة.",
        en: "A transformer foundation in Sharurah — excavation, foundations and cable trenches, with the power transformer received and moved inside the station.",
      },
    },
    ...build("sharurah-transformer-base", sharurahAlts, {
      ar: "محوّل القدرة على مقطورة النقل داخل موقع محطة شرورة",
      en: "The power transformer on its transport trailer inside the Sharurah station site",
    }),
  },
  {
    slug: "bisha-project",
    order: 2,
    published: true,
    sourceFolder: "مشروع بيشة",
    title: { ar: "مشروع بيشة", en: "Bisha Project" },
    shortTitle: { ar: "بيشة", en: "Bisha" },
    location: { ar: "بيشة", en: "Bisha" },
    summary: {
      ar: "مشروع منفّذ في بيشة. تُظهر صور الموقع هيكلاً خرسانياً كبيراً يجري تنفيذه بأعمال قوالب وحديد تسليح وسقالات وأعمال قواعد وعزل، مع مناوبات عمل ليلية.",
      en: "A project executed in Bisha. The site photographs show a large concrete structure being built with formwork, reinforcement, scaffolding, foundation and waterproofing works, including night shifts.",
    },
    documented: {
      ar: [
        "تنفيذ هيكل خرساني بقوالب وحديد تسليح",
        "نصب سقالات متعددة الطوابق حول المبنى",
        "أعمال حفر وقواعد وعزل عند محيط المبنى",
        "أعمال مجاري وتمديدات خرسانية داخلية",
        "أخذ عيّنات مكعبات خرسانية للفحص في الموقع",
        "تشغيل مناوبات ليلية بإضاءة موقع كاملة",
      ],
      en: [
        "Concrete structure executed with formwork and reinforcement",
        "Multi-lift scaffolding erected around the building",
        "Excavation, foundation and waterproofing works at the perimeter",
        "Internal concrete trench and services works",
        "Concrete cube samples taken for on-site testing",
        "Night shifts operated under full site lighting",
      ],
    },
    relatedServices: ["building-construction", "structural-support"],
    seo: {
      title: { ar: "مشروع بيشة", en: "Bisha Project" },
      description: {
        ar: "مشروع بيشة — أعمال هيكل خرساني وقوالب وسقالات وقواعد وعزل، من تنفيذ شركة عمران العصر الحديثة للمقاولات.",
        en: "Bisha Project — concrete structure, formwork, scaffolding, foundations and waterproofing works by Imran Alasr Alhaditha Contracting.",
      },
    },
    ...build("bisha-project", bishaAlts, {
      ar: "الهيكل الخرساني لمشروع بيشة محاطاً بالسقالات تحت إضاءة الموقع الليلية",
      en: "The concrete structure of the Bisha Project enclosed in scaffolding under night site lighting",
    }),
  },
  {
    slug: "jazan-transformer-firewalls",
    order: 3,
    published: true,
    sourceFolder: "جدران حماية المحولات مشروع جازان",
    title: { ar: "جدران حماية المحوّلات — مشروع جازان", en: "Transformer Protection Walls — Jazan Project" },
    shortTitle: { ar: "جدران حماية المحوّلات", en: "Transformer Protection Walls" },
    location: { ar: "جازان", en: "Jazan" },
    summary: {
      ar: "تنفيذ جدران حماية للمحوّلات ضمن مشروع جازان. تُظهر صور الموقع جدراناً خرسانية مصبوبة في مواقعها بسقالات محيطة، مع أعمال قواعد وعزل وردم ودمك.",
      en: "Construction of transformer protection walls within the Jazan project. The site photographs show cast-in-place concrete walls with surrounding scaffolding, alongside foundation, waterproofing, backfill and compaction works.",
    },
    documented: {
      ar: [
        "صب جدران خرسانية بارتفاع كامل في مواقعها",
        "نصب سقالات محيطة بشبكات أمان",
        "أعمال قواعد وعزل حول الجدران",
        "ردم ودمك بالمدحلة أمام الجدران",
        "تركيب قواعد معدنية على الأسطح الخرسانية",
        "استخدام رافعة لخدمة أعمال الارتفاعات",
      ],
      en: [
        "Full-height concrete walls cast in position",
        "Perimeter scaffolding erected with safety netting",
        "Foundation and waterproofing works around the walls",
        "Backfill and roller compaction in front of the walls",
        "Steel bases fixed onto the concrete surfaces",
        "Crane used to serve works at height",
      ],
    },
    relatedServices: ["structural-support", "electrical-power"],
    seo: {
      title: { ar: "جدران حماية المحوّلات — جازان", en: "Transformer Protection Walls — Jazan" },
      description: {
        ar: "تنفيذ جدران حماية خرسانية للمحوّلات في جازان — صب في الموقع، سقالات، قواعد وعزل، ردم ودمك.",
        en: "Cast-in-place concrete transformer protection walls in Jazan — scaffolding, foundations, waterproofing, backfill and compaction.",
      },
    },
    ...build("jazan-transformer-firewalls", jazanWallAlts, {
      ar: "جدار حماية المحوّلات في جازان محاطاً بالسقالات أثناء العمل الليلي",
      en: "A transformer protection wall in Jazan enclosed in scaffolding during night works",
    }),
  },
  {
    slug: "asir-control-rooms",
    order: 4,
    published: true,
    sourceFolder: "إصلاح غرف التحكم عسير",
    title: { ar: "إصلاح غرف التحكم — عسير", en: "Control Rooms Rehabilitation — Asir" },
    shortTitle: { ar: "إصلاح غرف التحكم", en: "Control Rooms Rehabilitation" },
    location: { ar: "عسير", en: "Asir" },
    summary: {
      ar: "أعمال إصلاح لغرف التحكم في عسير. تُظهر صور الموقع تركيب ألواح جدارية كبيرة على أُطر وقواعد معدنية، مع أعمال قواعد ومناسيب وفتحات أرضية للتمديدات.",
      en: "Rehabilitation works to control rooms in Asir. The site photographs show large wall panels being installed on steel frames and bases, alongside plinth, levelling and floor-opening works for services.",
    },
    documented: {
      ar: [
        "تركيب ألواح جدارية كبيرة داخل حيّز غرف التحكم",
        "تصنيع وتثبيت أُطر وقواعد معدنية أسفل الجدران",
        "تركيب منصة معدنية مجلفنة",
        "أعمال مناسيب وتحقق بميزان الاستواء",
        "معالجة فتحات أرضية تظهر التمديدات",
        "تأمين الموقع بالحواجز وطفايات الحريق ومعدات الوقاية",
      ],
      en: [
        "Large wall panels installed inside the control room bays",
        "Steel frames and bases fabricated and fixed beneath the walls",
        "Galvanised steel platform installed",
        "Levelling works verified with a spirit level",
        "Floor openings exposing services treated",
        "Site secured with barriers, fire extinguishers and PPE",
      ],
    },
    relatedServices: ["restoration-finishing", "structural-support"],
    seo: {
      title: { ar: "إصلاح غرف التحكم — عسير", en: "Control Rooms Rehabilitation — Asir" },
      description: {
        ar: "أعمال إصلاح غرف التحكم في عسير — تركيب ألواح جدارية، أُطر وقواعد معدنية، أعمال مناسيب وتمديدات.",
        en: "Control room rehabilitation in Asir — wall panel installation, steel frames and bases, levelling and services works.",
      },
    },
    ...build("asir-control-rooms", asirAlts, {
      ar: "إطار قاعدة معدني مثبّت أسفل جدار غرفة التحكم في مشروع عسير",
      en: "A steel base frame fixed beneath a control room wall on the Asir project",
    }),
  },
  {
    slug: "jazan-power-warehouses",
    order: 5,
    published: true,
    sourceFolder: "إنشاء مستودعات لمحطات الطاقة مشروع جازان",
    title: { ar: "إنشاء مستودعات لمحطات الطاقة — مشروع جازان", en: "Warehouses for Power Stations — Jazan Project" },
    shortTitle: { ar: "مستودعات محطات الطاقة", en: "Power Station Warehouses" },
    location: { ar: "جازان", en: "Jazan" },
    summary: {
      ar: "إنشاء مستودعات لمحطات الطاقة ضمن مشروع جازان. تُظهر صور الموقع مستودعات بهيكل معدني مسلَّمة بأرضيات إيبوكسية وجدران مكتملة ورفوف تخزين مركّبة.",
      en: "Construction of warehouses for power stations within the Jazan project. The site photographs show steel-framed warehouses handed over with epoxy floors, completed walls and installed storage racking.",
    },
    documented: {
      ar: [
        "مستودعات بهيكل معدني وأسقف جملونية",
        "تنفيذ أرضيات إيبوكسية مصقولة",
        "تشطيب الجدران الداخلية والطلاء",
        "تركيب رفوف تخزين معدنية على الجدران والزوايا",
        "تعليم مناطق التشغيل على الأرضية",
        "أعمال واجهات خارجية وتركيب وحدات تكييف",
      ],
      en: [
        "Steel-framed warehouses with pitched roofs",
        "Polished epoxy floors executed",
        "Internal wall finishing and painting",
        "Steel storage racking installed along walls and corners",
        "Operational zones marked on the floor",
        "External elevation works and air-conditioning units installed",
      ],
    },
    relatedServices: ["building-construction", "restoration-finishing", "electrical-power"],
    seo: {
      title: { ar: "مستودعات محطات الطاقة — جازان", en: "Power Station Warehouses — Jazan" },
      description: {
        ar: "إنشاء مستودعات لمحطات الطاقة في جازان — هيكل معدني، أرضيات إيبوكسية، تشطيبات ورفوف تخزين.",
        en: "Warehouses for power stations in Jazan — steel frame, epoxy floors, finishing works and storage racking.",
      },
    },
    ...build("jazan-power-warehouses", jazanWarehouseAlts, {
      ar: "داخل أحد مستودعات محطات الطاقة في جازان بعد اكتمال الأرضية وتركيب الرفوف",
      en: "Interior of a power station warehouse in Jazan with the floor complete and racking installed",
    }),
  },
];

export const publishedProjects = projects.filter((p) => p.published).sort((a, b) => a.order - b.order);

/**
 * The photograph that opens the home page, beside «شركة تنفيذ، لا شركة وعود».
 *
 * This is an editorial choice, not a by-product of project ordering: the frame
 * has to show work being carried out, because the heading beside it claims
 * execution over rhetoric. Adding or reordering projects must not silently
 * change it — hence a named slug and index rather than `projects[0]`.
 *
 * `position` is the object-position for the 4:5 crop. The slight downward bias
 * keeps the screed and the wet slab inside the frame across the parallax
 * travel; the transmission tower on the skyline is what survives at the top.
 */
export const openingFigure = {
  slug: "bisha-project",
  galleryIndex: 11,
  position: "50% 55%",
} as const;

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}

export function nextProject(slug: string) {
  const list = publishedProjects;
  const i = list.findIndex((p) => p.slug === slug);
  return list[(i + 1) % list.length];
}
