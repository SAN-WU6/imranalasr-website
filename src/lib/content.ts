import "server-only";
import { getOverridesByPrefix } from "./db";
import { projects as baseProjects, type Project } from "@/content/projects";
import { services as baseServices, type Service } from "@/content/services";
import { credentials as baseCredentials, type Credential } from "@/content/certifications";
import { company as baseCompany } from "@/content/company";
import { getCmsProject, listCmsProjects } from "./db/projects";

/**
 * Content resolution.
 *
 * Files in `src/content` are the source of truth as delivered. The admin panel
 * writes *overrides* into the database; this module merges them on top. That
 * gives editable content without turning the fact layer into free-form data
 * that could drift away from the official documents.
 */

export type ProjectOverride = Partial<{
  published: boolean;
  order: number;
  title: { ar: string; en: string };
  shortTitle: { ar: string; en: string };
  location: { ar: string; en: string };
  summary: { ar: string; en: string };
  documented: { ar: string[]; en: string[] };
  seo: { title: { ar: string; en: string }; description: { ar: string; en: string } };
  coverSrc: string;
  hiddenImages: string[];
  imageOrder: string[];
  extraImages: { src: string; w: number; h: number; blur: string; alt: { ar: string; en: string } }[];
}>;

export type ServiceOverride = Partial<{
  published: boolean;
  order: number;
  title: { ar: string; en: string };
  lead: { ar: string; en: string };
}>;

export type CredentialOverride = Partial<{ published: boolean; order: number }>;

export type CompanyOverride = Partial<{
  email: string;
  phonePrimary: string;
  phonePrimaryDisplay: string;
  phoneSecondary: string;
  phoneSecondaryDisplay: string;
  whatsapp: string;
  addressAr: string;
  addressEn: string;
  hoursAr: string;
  hoursEn: string;
}>;

const KEY = {
  project: (slug: string) => `project:${slug}`,
  service: (slug: string) => `service:${slug}`,
  credential: (id: string) => `credential:${id}`,
  company: "company:contact",
};

export async function resolveProjects(includeUnpublished = false): Promise<Project[]> {
  const cms = await listCmsProjects(includeUnpublished, false);
  if (cms) return cms;
  const overrides = await getOverridesByPrefix<ProjectOverride>("project:");
  const merged = baseProjects.map((p) => {
    const o = overrides[KEY.project(p.slug)] ?? {};
    const hidden = new Set(o.hiddenImages ?? []);
    let gallery = p.gallery.filter((g) => !hidden.has(g.src));
    if (o.extraImages?.length) gallery = [...gallery, ...o.extraImages];
    if (o.imageOrder?.length) {
      const pos = new Map(o.imageOrder.map((src, i) => [src, i]));
      gallery = [...gallery].sort(
        (a, b) => (pos.get(a.src) ?? 1e6) - (pos.get(b.src) ?? 1e6)
      );
    }
    const cover =
      o.coverSrc && gallery.find((g) => g.src === o.coverSrc)
        ? { ...gallery.find((g) => g.src === o.coverSrc)!, alt: p.cover.alt }
        : p.cover;
    return {
      ...p,
      published: o.published ?? p.published,
      order: o.order ?? p.order,
      title: o.title ?? p.title,
      shortTitle: o.shortTitle ?? p.shortTitle,
      location: o.location ?? p.location,
      summary: o.summary ?? p.summary,
      documented: o.documented ?? p.documented,
      seo: o.seo ?? p.seo,
      cover,
      gallery,
    } satisfies Project;
  });
  return merged
    .filter((p) => includeUnpublished || p.published)
    .sort((a, b) => a.order - b.order);
}

export async function resolveProjectForAdmin(slug: string) {
  const cms = await getCmsProject(slug, true);
  if (cms) return cms;
  return resolveProject(slug, true);
}

export async function resolveProject(slug: string, includeUnpublished = false) {
  const list = await resolveProjects(includeUnpublished);
  return list.find((p) => p.slug === slug);
}

export async function resolveServices(includeUnpublished = false): Promise<(Service & { published: boolean })[]> {
  const overrides = await getOverridesByPrefix<ServiceOverride>("service:");
  return baseServices
    .map((s, i) => {
      const o = overrides[KEY.service(s.slug)] ?? {};
      return {
        ...s,
        title: o.title ?? s.title,
        lead: o.lead ?? s.lead,
        published: o.published ?? true,
        order: o.order ?? i + 1,
      };
    })
    .filter((s) => includeUnpublished || s.published)
    .sort((a, b) => a.order - b.order)
    .map(({ order: _order, ...rest }) => rest as Service & { published: boolean });
}

export async function resolveCredentials(includeUnpublished = false): Promise<Credential[]> {
  const overrides = await getOverridesByPrefix<CredentialOverride>("credential:");
  return baseCredentials
    .map((c, i) => {
      const o = overrides[KEY.credential(c.id)] ?? {};
      return { ...c, published: o.published ?? true, order: o.order ?? i + 1 };
    })
    .filter((c) => includeUnpublished || c.published)
    .sort((a, b) => a.order - b.order);
}

export type ResolvedCompany = ReturnType<typeof shapeCompany>;

function shapeCompany(o: CompanyOverride) {
  return {
    ...baseCompany,
    contact: {
      ...baseCompany.contact,
      email: o.email ?? baseCompany.contact.email,
      phonePrimary: o.phonePrimary ?? baseCompany.contact.phonePrimary,
      phonePrimaryDisplay: o.phonePrimaryDisplay ?? baseCompany.contact.phonePrimaryDisplay,
      phoneSecondary: o.phoneSecondary ?? baseCompany.contact.phoneSecondary,
      phoneSecondaryDisplay: o.phoneSecondaryDisplay ?? baseCompany.contact.phoneSecondaryDisplay,
      whatsapp: o.whatsapp ?? baseCompany.contact.whatsapp,
    },
    address: {
      ...baseCompany.address,
      lines: {
        ar: o.addressAr ?? baseCompany.address.lines.ar,
        en: o.addressEn ?? baseCompany.address.lines.en,
      },
    },
    hours: {
      ar: o.hoursAr ?? "الأحد – الخميس · 8:00 ص – 5:00 م",
      en: o.hoursEn ?? "Sunday – Thursday · 8:00 – 17:00",
    },
  };
}

export async function resolveCompany() {
  const overrides = await getOverridesByPrefix<CompanyOverride>("company:");
  return shapeCompany(overrides[KEY.company] ?? {});
}

export const contentKeys = KEY;
