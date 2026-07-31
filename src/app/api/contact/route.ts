import { handleSubmission } from "../_shared";
import { contactSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return handleSubmission({
    request,
    table: "contact_messages",
    schema: contactSchema,
    subject: "رسالة جديدة من الموقع / New website message",
    map: (d) => ({
      name: d.name,
      company: d.company || null,
      email: d.email,
      phone: d.phone || null,
      subject: d.subject,
      message: d.message,
    }),
    rows: (d) => [
      ["الاسم / Name", d.name],
      ["المنشأة / Organisation", d.company || "—"],
      ["البريد / Email", d.email],
      ["الجوال / Mobile", d.phone || "—"],
      ["الموضوع / Subject", d.subject],
      ["الرسالة / Message", d.message],
    ],
  });
}
