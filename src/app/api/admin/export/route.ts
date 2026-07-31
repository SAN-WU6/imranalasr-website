import { NextResponse } from "next/server";
import { currentAdmin } from "@/lib/auth";
import { listRows, type TableName } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TABLES: Record<string, TableName> = {
  quotes: "quote_requests",
  profiles: "profile_requests",
  messages: "contact_messages",
};

function toCsv(rows: Record<string, unknown>[]) {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const cell = (v: unknown) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers.join(","), ...rows.map((r) => headers.map((h) => cell(r[h])).join(","))].join("\r\n");
}

export async function GET(request: Request) {
  const admin = await currentAdmin();
  if (!admin) return NextResponse.json({ error: "unauthorised" }, { status: 401 });

  const url = new URL(request.url);
  const type = url.searchParams.get("type") ?? "quotes";
  const table = TABLES[type];
  if (!table) return NextResponse.json({ error: "unknown_type" }, { status: 400 });

  const rows = await listRows<Record<string, unknown>>(table, {
    q: url.searchParams.get("q") ?? undefined,
    status: url.searchParams.get("status") ?? undefined,
    limit: 1000,
  });

  const stamp = new Date().toISOString().slice(0, 10);
  // BOM so Excel opens the Arabic columns correctly.
  const body = `﻿${toCsv(rows)}`;

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="imran-${type}-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
