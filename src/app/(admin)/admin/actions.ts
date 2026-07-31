"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { audit, clearOverride, setOverride, updateRow, type TableName } from "@/lib/db";
import { authenticate, endSession, requireAdmin, startSession } from "@/lib/auth";
import {
  createCmsProject,
  deleteCmsProject,
  getCmsProject,
  seedBaseProjects,
  updateCmsImages,
  updateCmsProject,
  type ProjectImageRow,
} from "@/lib/db/projects";

export type ActionState = { ok?: boolean; error?: string };

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin");

  if (!email || !password) return { error: "invalid" };
  const ok = await authenticate(email, password);
  if (!ok) return { error: "invalid" };

  await startSession(email.trim().toLowerCase());
  await audit(email, "login", "admin");
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function logoutAction() {
  await endSession();
  redirect("/admin/login");
}

const TABLES: Record<string, TableName> = {
  quotes: "quote_requests",
  profiles: "profile_requests",
  messages: "contact_messages",
};

export async function updateRequestAction(formData: FormData) {
  const actor = await requireAdmin();
  const kind = String(formData.get("kind") ?? "");
  const ref = String(formData.get("ref") ?? "");
  const table = TABLES[kind];
  if (!table || !ref) return;

  const patch: Record<string, unknown> = {};
  const status = formData.get("status");
  const notes = formData.get("notes");
  if (typeof status === "string" && status) patch.status = status;
  if (typeof notes === "string") patch.notes = notes.slice(0, 8000);

  await updateRow(table, ref, patch);
  await audit(actor, `update:${kind}`, ref);
  revalidatePath(`/admin/${kind}`);
  revalidatePath(`/admin/${kind}/${ref}`);
  revalidatePath("/admin");
}

/* ─────────────────────────── content editing ─────────────────────────── */

function bilingual(formData: FormData, base: string) {
  const ar = formData.get(`${base}_ar`);
  const en = formData.get(`${base}_en`);
  if (typeof ar !== "string" || typeof en !== "string") return undefined;
  if (!ar.trim() && !en.trim()) return undefined;
  return { ar: ar.trim(), en: en.trim() };
}

function bilingualList(formData: FormData, base: string) {
  const ar = formData.get(`${base}_ar`);
  const en = formData.get(`${base}_en`);
  if (typeof ar !== "string" || typeof en !== "string") return undefined;
  const split = (s: string) => s.split("\n").map((l) => l.trim()).filter(Boolean);
  if (!ar.trim() && !en.trim()) return undefined;
  return { ar: split(ar), en: split(en) };
}

export async function saveProjectAction(formData: FormData) {
  const actor = await requireAdmin();
  const slug = String(formData.get("slug") ?? "");
  if (!slug) return;

  const cms = await getCmsProject(slug, true);
  if (cms) {
    const title = bilingual(formData, "title") ?? cms.title;
    const shortTitle = bilingual(formData, "shortTitle") ?? cms.shortTitle;
    const location = bilingual(formData, "location") ?? cms.location;
    const summary = bilingual(formData, "summary") ?? cms.summary;
    const documented = bilingualList(formData, "documented") ?? cms.documented;
    const seoTitle = bilingual(formData, "seoTitle") ?? cms.seo.title;
    const seoDescription = bilingual(formData, "seoDescription") ?? cms.seo.description;
    const cover = String(formData.get("coverSrc") ?? "") || null;
    await updateCmsProject(slug, {
      published: formData.get("published") === "on",
      display_order: Math.max(1, Number(formData.get("order") ?? 1) || 1),
      title_ar: title.ar,
      title_en: title.en,
      short_title_ar: shortTitle.ar,
      short_title_en: shortTitle.en,
      location_ar: location.ar,
      location_en: location.en,
      summary_ar: summary.ar,
      summary_en: summary.en,
      documented_ar: documented.ar,
      documented_en: documented.en,
      seo_title_ar: seoTitle.ar,
      seo_title_en: seoTitle.en,
      seo_description_ar: seoDescription.ar,
      seo_description_en: seoDescription.en,
      cover_src: cover,
      cover_portrait_src: cover,
    });
    const rawImages = String(formData.get("imageState") ?? "[]");
    try {
      const parsed = JSON.parse(rawImages) as Array<Partial<ProjectImageRow>>;
      const allowed = new Set(cms.images.map((item) => item.id));
      const valid = parsed
        .filter((item) => Number.isInteger(item.id) && allowed.has(Number(item.id)))
        .map((item, index) => ({
          id: Number(item.id),
          display_order: index + 1,
          visible: item.visible !== false,
          alt_ar: String(item.alt_ar ?? "").slice(0, 500),
          alt_en: String(item.alt_en ?? "").slice(0, 500),
        }));
      await updateCmsImages(slug, valid);
    } catch {
      // Text changes remain saveable if a stale browser submits malformed image state.
    }
    await audit(actor, "content:project", slug);
    revalidateContent();
    return;
  }

  const override: Record<string, unknown> = {
    published: formData.get("published") === "on",
    order: Number(formData.get("order") ?? 1),
  };
  const title = bilingual(formData, "title");
  const shortTitle = bilingual(formData, "shortTitle");
  const location = bilingual(formData, "location");
  const summary = bilingual(formData, "summary");
  const documented = bilingualList(formData, "documented");
  const seoTitle = bilingual(formData, "seoTitle");
  const seoDescription = bilingual(formData, "seoDescription");

  if (title) override.title = title;
  if (shortTitle) override.shortTitle = shortTitle;
  if (location) override.location = location;
  if (summary) override.summary = summary;
  if (documented) override.documented = documented;
  if (seoTitle && seoDescription) override.seo = { title: seoTitle, description: seoDescription };

  const cover = formData.get("coverSrc");
  if (typeof cover === "string" && cover) override.coverSrc = cover;

  override.hiddenImages = formData.getAll("hidden").map(String);
  const order = formData.get("imageOrder");
  if (typeof order === "string" && order.trim()) {
    override.imageOrder = order.split(/[\n,]/).map((s) => s.trim()).filter(Boolean);
  }

  await setOverride(`project:${slug}`, override);
  await audit(actor, "content:project", slug);
  revalidateContent();
}

export async function seedProjectsAction() {
  const actor = await requireAdmin();
  const seeded = await seedBaseProjects();
  await audit(actor, "content:projects:seed", seeded ? "created" : "unchanged");
  revalidateContent();
}

export async function createProjectAction(formData: FormData) {
  const actor = await requireAdmin();
  await seedBaseProjects();
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  const titleAr = String(formData.get("title_ar") ?? "").trim();
  const titleEn = String(formData.get("title_en") ?? "").trim();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || !titleAr || !titleEn) {
    redirect("/admin/content/projects/new?error=invalid");
  }
  const order = Math.max(1, Number(formData.get("order") ?? 1) || 1);
  try {
    await createCmsProject({
      slug,
      display_order: order,
      published: false,
      source_folder: "",
      title_ar: titleAr,
      title_en: titleEn,
      short_title_ar: titleAr,
      short_title_en: titleEn,
      location_ar: String(formData.get("location_ar") ?? "").trim(),
      location_en: String(formData.get("location_en") ?? "").trim(),
      summary_ar: "",
      summary_en: "",
      documented_ar: [],
      documented_en: [],
      related_services: [],
      seo_title_ar: titleAr,
      seo_title_en: titleEn,
      seo_description_ar: "",
      seo_description_en: "",
      cover_src: null,
      cover_portrait_src: null,
    });
  } catch {
    redirect("/admin/content/projects/new?error=exists");
  }
  await audit(actor, "content:project:create", slug);
  revalidateContent();
  redirect(`/admin/content/projects/${slug}`);
}

export async function deleteProjectAction(formData: FormData) {
  const actor = await requireAdmin();
  const slug = String(formData.get("slug") ?? "");
  if (!slug) return;
  await deleteCmsProject(slug);
  await audit(actor, "content:project:delete", slug);
  revalidateContent();
  redirect("/admin/content");
}

export async function resetProjectAction(formData: FormData) {
  const actor = await requireAdmin();
  const slug = String(formData.get("slug") ?? "");
  if (!slug) return;
  await clearOverride(`project:${slug}`);
  await audit(actor, "content:project:reset", slug);
  revalidateContent();
}

export async function saveServiceAction(formData: FormData) {
  const actor = await requireAdmin();
  const slug = String(formData.get("slug") ?? "");
  if (!slug) return;
  const override: Record<string, unknown> = {
    published: formData.get("published") === "on",
    order: Number(formData.get("order") ?? 1),
  };
  const title = bilingual(formData, "title");
  const lead = bilingual(formData, "lead");
  if (title) override.title = title;
  if (lead) override.lead = lead;
  await setOverride(`service:${slug}`, override);
  await audit(actor, "content:service", slug);
  revalidateContent();
}

export async function saveCredentialAction(formData: FormData) {
  const actor = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await setOverride(`credential:${id}`, {
    published: formData.get("published") === "on",
    order: Number(formData.get("order") ?? 1),
  });
  await audit(actor, "content:credential", id);
  revalidateContent();
}

export async function saveCompanyAction(formData: FormData) {
  const actor = await requireAdmin();
  const keys = [
    "email",
    "phonePrimary",
    "phonePrimaryDisplay",
    "phoneSecondary",
    "phoneSecondaryDisplay",
    "whatsapp",
    "addressAr",
    "addressEn",
    "hoursAr",
    "hoursEn",
  ] as const;
  const override: Record<string, string> = {};
  for (const k of keys) {
    const v = formData.get(k);
    if (typeof v === "string" && v.trim()) override[k] = v.trim();
  }
  await setOverride("company:contact", override);
  await audit(actor, "content:company", "contact");
  revalidateContent();
}

function revalidateContent() {
  for (const locale of ["ar", "en"]) {
    revalidatePath(`/${locale}`);
    revalidatePath(`/${locale}/about`);
    revalidatePath(`/${locale}/services`);
    revalidatePath(`/${locale}/projects`);
    revalidatePath(`/${locale}/projects/[slug]`, "page");
    revalidatePath(`/${locale}/quality`);
    revalidatePath(`/${locale}/contact`);
    revalidatePath(`/${locale}/quote`);
  }
  revalidatePath("/admin/content");
}
