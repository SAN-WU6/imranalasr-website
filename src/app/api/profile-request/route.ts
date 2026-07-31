import { handleSubmission } from "../_shared";
import { profileSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return handleSubmission({
    request,
    table: "profile_requests",
    schema: profileSchema,
    subject: "طلب ملف تأهيل / Company profile request",
    map: (d) => ({
      name: d.name,
      company: d.company,
      job_title: d.jobTitle || null,
      email: d.email,
      phone: d.phone,
      reason: d.reason,
      related_opportunity: d.relatedOpportunity || null,
    }),
    rows: (d) => [
      ["الاسم / Name", d.name],
      ["المنشأة / Organisation", d.company],
      ["المسمى / Job title", d.jobTitle || "—"],
      ["البريد المهني / Work email", d.email],
      ["الجوال / Mobile", d.phone],
      ["الفرصة المرتبطة / Related opportunity", d.relatedOpportunity || "—"],
      ["سبب الطلب / Reason", d.reason],
    ],
  });
}
