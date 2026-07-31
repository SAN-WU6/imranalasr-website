import { handleSubmission } from "../_shared";
import { quoteSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return handleSubmission({
    request,
    table: "quote_requests",
    schema: quoteSchema,
    subject: "طلب عرض سعر جديد / New quote request",
    map: (d) => ({
      name: d.name,
      company: d.company,
      job_title: d.jobTitle || null,
      phone: d.phone,
      email: d.email,
      project_type: d.projectType,
      project_location: d.projectLocation,
      scope_of_work: d.scopeOfWork,
      description: d.description,
      start_window: d.startDate || null,
      duration: d.duration || null,
      preferred_contact: d.preferredContact,
      user_agent: null,
    }),
    rows: (d) => [
      ["الاسم / Name", d.name],
      ["المنشأة / Organisation", d.company],
      ["المسمى / Job title", d.jobTitle || "—"],
      ["الجوال / Mobile", d.phone],
      ["البريد / Email", d.email],
      ["نوع المشروع / Project type", d.projectType],
      ["موقع المشروع / Location", d.projectLocation],
      ["نطاق الأعمال / Scope", d.scopeOfWork],
      ["الوصف / Description", d.description],
      ["موعد البدء / Start", d.startDate || "—"],
      ["المدة / Duration", d.duration || "—"],
      ["التواصل المفضل / Preferred contact", d.preferredContact],
    ],
  });
}
