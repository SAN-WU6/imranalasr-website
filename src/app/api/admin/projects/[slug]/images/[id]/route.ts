import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { audit } from "@/lib/db";
import { deleteCmsImage, getCmsProject, updateCmsProject } from "@/lib/db/projects";

export async function DELETE(_request: Request, { params }: { params: Promise<{ slug: string; id: string }> }) {
  let actor: string;
  try { actor = await requireAdmin(); } catch { return NextResponse.json({ error: "انتهت جلسة الدخول." }, { status: 401 }); }
  const { slug, id } = await params;
  const imageId = Number(id);
  if (!Number.isSafeInteger(imageId)) return NextResponse.json({ error: "رقم الصورة غير صحيح." }, { status: 400 });
  const project = await getCmsProject(slug, true);
  if (!project) return NextResponse.json({ error: "المشروع غير موجود." }, { status: 404 });
  const deleted = await deleteCmsImage(slug, imageId);
  if (!deleted) return NextResponse.json({ error: "الصورة غير موجودة." }, { status: 404 });
  if (project.cover.src === deleted.src || project.coverPortrait.src === deleted.src) {
    const replacement = project.images.find((item) => item.id !== imageId && item.visible)?.src ?? null;
    await updateCmsProject(slug, { cover_src: replacement, cover_portrait_src: replacement });
  }
  await audit(actor, "content:project:image:delete", `${slug}:${imageId}`);
  return NextResponse.json({ ok: true });
}
