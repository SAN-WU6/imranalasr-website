import "server-only";

/**
 * Transactional email through Resend's HTTP API.
 *
 * When RESEND_API_KEY is absent the site keeps working: the submission is
 * already persisted, and the notification is written to the server log so
 * nothing is silently lost. `sendMail` never throws into the request path.
 */

type MailInput = { subject: string; html: string; text: string; replyTo?: string };

export async function sendMail({ subject, html, text, replyTo }: MailInput): Promise<{ sent: boolean; reason?: string }> {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.MAIL_TO || "requests@imranalasr.sa";
  const from = process.env.MAIL_FROM || "Imran Alasr Website <onboarding@resend.dev>";

  if (!key) {
    console.info(
      `[mail:not-configured] would send to ${to}\nsubject: ${subject}\n${text}`
    );
    return { sent: false, reason: "RESEND_API_KEY not set" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], subject, html, text, ...(replyTo ? { reply_to: replyTo } : {}) }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error(`[mail:failed] ${res.status} ${body.slice(0, 300)}`);
      return { sent: false, reason: `resend ${res.status}` };
    }
    return { sent: true };
  } catch (err) {
    console.error("[mail:error]", err);
    return { sent: false, reason: "network" };
  }
}

const esc = (s: string) =>
  s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

export function renderNotification(title: string, reference: string, rows: [string, string][]) {
  const text = [`${title}`, `المرجع / Reference: ${reference}`, "", ...rows.map(([k, v]) => `${k}: ${v}`)].join("\n");
  const html = `<!doctype html><html><body style="margin:0;background:#f6f4f1;padding:28px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#232525">
  <table role="presentation" width="100%" style="max-width:640px;margin:0 auto;background:#fff;border:1px solid #ece8e2;border-radius:10px;border-collapse:separate">
    <tr><td style="padding:24px 28px;border-bottom:3px solid #d18638">
      <div style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#b56d28">Imran Alasr Alhaditha</div>
      <h1 style="margin:6px 0 0;font-size:20px;color:#0e191c">${esc(title)}</h1>
      <div style="margin-top:10px;font-family:ui-monospace,SFMono-Regular,monospace;font-size:14px;color:#135157">${esc(reference)}</div>
    </td></tr>
    <tr><td style="padding:8px 28px 24px">
      <table role="presentation" width="100%" style="border-collapse:collapse;font-size:14px">
        ${rows
          .map(
            ([k, v]) =>
              `<tr><td style="padding:11px 0;border-bottom:1px solid #f0ece6;color:#6c6f6f;width:38%;vertical-align:top">${esc(
                k
              )}</td><td style="padding:11px 0;border-bottom:1px solid #f0ece6;color:#191a1a;white-space:pre-wrap">${esc(
                v
              )}</td></tr>`
          )
          .join("")}
      </table>
    </td></tr>
  </table></body></html>`;
  return { html, text };
}
