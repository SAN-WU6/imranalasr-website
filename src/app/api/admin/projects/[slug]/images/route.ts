import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import sharp from "sharp";
import { requireAdmin } from "@/lib/auth";
import { audit } from "@/lib/db";
import { getCmsProject, insertCmsImage } from "@/lib/db/projects";
import { storageDelete, storageUpload } from "@/lib/db/supabase";

export const runtime = "nodejs";

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  let actor: string;
  try { actor = await requireAdmin(); } catch { return NextResponse.json({ error: "انتهت جلسة الدخول." }, { status: 401 }); }
  const { slug } = await params;
  const project = await getCmsProject(slug, true);
  if (!project) return NextResponse.json({ error: "المشروع غير موجود." }, { status: 404 });
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "اختر صورة صحيحة." }, { status: 400 });
  if (file.size > 4 * 1024 * 1024) return NextResponse.json({ error: "حجم الصورة أكبر من 4 ميجابايت." }, { status: 413 });
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    return NextResponse.json({ error: "الصيغة المسموحة JPG أو PNG أو WebP." }, { status: 415 });
  }

  let output: Buffer;
  let width: number;
  let height: number;
  let blur: string;
  try {
    const source = sharp(Buffer.from(await file.arrayBuffer()), { failOn: "error" }).rotate();
    output = await source.clone().resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true }).webp({ quality: 84 }).toBuffer();
    const metadata = await sharp(output).metadata();
    if (!metadata.width || !metadata.height) throw new Error("dimensions");
    width = metadata.width;
    height = metadata.height;
    const tiny = await sharp(output).resize({ width: 20 }).webp({ quality: 45 }).toBuffer();
    blur = `data:image/webp;base64,${tiny.toString("base64")}`;
  } catch {
    return NextResponse.json({ error: "ملف الصورة تالف أو غير مدعوم." }, { status: 400 });
  }

  const storagePath = `${slug}/${Date.now()}-${randomUUID()}.webp`;
  let src = "";
  try {
    src = await storageUpload(storagePath, output, "image/webp");
    const row = await insertCmsImage({
      project_slug: slug,
      src,
      storage_path: storagePath,
      width,
      height,
      blur,
      alt_ar: project.title.ar,
      alt_en: project.title.en,
      display_order: project.images.length + 1,
      visible: true,
    });
    await audit(actor, "content:project:image:create", `${slug}:${row.id}`);
    return NextResponse.json({ image: row }, { status: 201 });
  } catch (error) {
    if (src) await storageDelete([storagePath]).catch(() => undefined);
    console.error("Project image upload failed", error);
    return NextResponse.json({ error: "تعذر حفظ الصورة. حاول مرة أخرى." }, { status: 500 });
  }
}
