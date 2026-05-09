import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
export const dynamic = "force-dynamic";

const h = () => ({
  apikey: process.env.SUPABASE_SERVICE_KEY!,
  Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY!}`,
  "Content-Type": "application/json",
});

export async function GET(req: NextRequest) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = process.env.SUPABASE_URL;
  if (!url) return NextResponse.json([]);

  const sp = new URL(req.url).searchParams;
  const limit = Math.min(parseInt(sp.get("limit") || "100", 10), 500);
  const adminFilter = sp.get("admin") || "";
  const actionFilter = sp.get("action") || "";
  const targetFilter = sp.get("target") || "";

  let query = `${url}/rest/v1/admin_audit_log?order=created_at.desc&limit=${limit}`;
  if (adminFilter) query += `&admin_email=eq.${encodeURIComponent(adminFilter)}`;
  if (actionFilter) query += `&action=eq.${encodeURIComponent(actionFilter)}`;
  if (targetFilter) query += `&target_user_email=eq.${encodeURIComponent(targetFilter)}`;

  const res = await fetch(query, { headers: h(), cache: "no-store" });
  return NextResponse.json(res.ok ? await res.json() : []);
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = process.env.SUPABASE_URL;
  if (!url) return NextResponse.json({ error: "Config" }, { status: 500 });

  const body = await req.json();
  const res = await fetch(`${url}/rest/v1/admin_audit_log`, {
    method: "POST",
    headers: { ...h(), Prefer: "return=minimal" },
    body: JSON.stringify(body),
  });
  return NextResponse.json({ ok: res.ok });
}
