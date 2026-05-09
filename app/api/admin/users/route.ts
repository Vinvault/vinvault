import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
export const dynamic = "force-dynamic";

const h = () => ({
  apikey: process.env.SUPABASE_SERVICE_KEY!,
  Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY!}`,
  "Content-Type": "application/json",
});

async function logAudit(adminEmail: string, action: string, targetEmail: string | null, details: Record<string, unknown>) {
  const url = process.env.SUPABASE_URL;
  if (!url) return;
  await fetch(`${url}/rest/v1/admin_audit_log`, {
    method: "POST",
    headers: { ...h(), Prefer: "return=minimal" },
    body: JSON.stringify({ admin_email: adminEmail, action, target_user_email: targetEmail, details }),
  }).catch(() => {});
}

export async function GET(req: NextRequest) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = process.env.SUPABASE_URL;
  if (!url) return NextResponse.json([]);

  const sp = new URL(req.url).searchParams;
  const search = sp.get("search") || "";
  const role = sp.get("role") || "";
  const banned = sp.get("banned") || "";
  const page = parseInt(sp.get("page") || "1", 10);
  const limit = 25;
  const offset = (page - 1) * limit;

  let query = `${url}/rest/v1/user_profiles?order=created_at.desc&limit=${limit}&offset=${offset}`;
  if (role) query += `&role=eq.${encodeURIComponent(role)}`;
  if (banned === "true") query += `&is_banned=eq.true`;
  else if (banned === "false") query += `&is_banned=eq.false`;

  const res = await fetch(query, { headers: { ...h(), Prefer: "count=exact" }, cache: "no-store" });
  const users = res.ok ? await res.json() : [];
  const total = parseInt((res.headers.get("content-range") || "0/0").split("/")[1] || "0", 10);

  // Filter by search in JS (Supabase free-text across multiple cols)
  const filtered = search
    ? users.filter((u: { email?: string; username?: string; country?: string }) =>
        (u.email || "").toLowerCase().includes(search.toLowerCase()) ||
        (u.username || "").toLowerCase().includes(search.toLowerCase()) ||
        (u.country || "").toLowerCase().includes(search.toLowerCase())
      )
    : users;

  return NextResponse.json({ users: filtered, total, page, limit });
}

export async function PATCH(req: NextRequest) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = process.env.SUPABASE_URL;
  if (!url) return NextResponse.json({ error: "Config" }, { status: 500 });

  const body = await req.json();
  const { id, email, admin_email, action, ...updates } = body;
  if (!id && !email) return NextResponse.json({ error: "id or email required" }, { status: 400 });

  const filter = id ? `id=eq.${id}` : `email=eq.${encodeURIComponent(email)}`;
  const res = await fetch(`${url}/rest/v1/user_profiles?${filter}`, {
    method: "PATCH",
    headers: { ...h(), Prefer: "return=representation" },
    body: JSON.stringify(updates),
  });

  if (res.ok) {
    const updated = await res.json();
    await logAudit(admin_email || "admin", action || "USER_UPDATED", updated[0]?.email || email || null, updates);
    return NextResponse.json({ ok: true, user: updated[0] });
  }
  return NextResponse.json({ error: await res.text() }, { status: 500 });
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = process.env.SUPABASE_URL;
  if (!url) return NextResponse.json({ error: "Config" }, { status: 500 });

  const body = await req.json();
  const res = await fetch(`${url}/rest/v1/user_profiles`, {
    method: "POST",
    headers: { ...h(), Prefer: "return=representation" },
    body: JSON.stringify(body),
  });
  const data = res.ok ? await res.json() : null;
  return res.ok ? NextResponse.json({ ok: true, user: data?.[0] }) : NextResponse.json({ error: await res.text() }, { status: 500 });
}
