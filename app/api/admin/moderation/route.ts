import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function requireAdmin(request: NextRequest): boolean {
  const cookie = request.headers.get("cookie") || "";
  return cookie.includes("vv_admin=");
}

export async function GET(request: NextRequest) {
  if (!requireAdmin(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !supabaseKey) return NextResponse.json({ error: "Config" }, { status: 500 });

  const res = await fetch(`${supabaseUrl}/rest/v1/user_flags?order=flag_count.desc`, {
    headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
    cache: "no-store",
  });
  if (!res.ok) return NextResponse.json({ error: "DB error" }, { status: 500 });
  return NextResponse.json(await res.json());
}

export async function POST(request: NextRequest) {
  if (!requireAdmin(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !supabaseKey) return NextResponse.json({ error: "Config" }, { status: 500 });

  const body = await request.json();
  const { action, user_email, reason, flagged_by } = body;

  if (action === "flag_user") {
    const existing = await fetch(
      `${supabaseUrl}/rest/v1/user_flags?user_email=eq.${encodeURIComponent(user_email)}&limit=1`,
      { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` }, cache: "no-store" }
    );
    const rows = await existing.json();
    if (rows.length > 0) {
      await fetch(`${supabaseUrl}/rest/v1/user_flags?user_email=eq.${encodeURIComponent(user_email)}`, {
        method: "PATCH",
        headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ flag_count: (rows[0].flag_count || 0) + 1, flagged_by, reason }),
      });
    } else {
      await fetch(`${supabaseUrl}/rest/v1/user_flags`, {
        method: "POST",
        headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}`, "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({ user_email, flagged_by, reason, flag_count: 1 }),
      });
    }
    return NextResponse.json({ ok: true });
  }

  if (action === "ban_user") {
    await fetch(`${supabaseUrl}/rest/v1/user_flags?user_email=eq.${encodeURIComponent(user_email)}`, {
      method: "PATCH",
      headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ is_banned: true }),
    });
    return NextResponse.json({ ok: true });
  }

  if (action === "unban_user") {
    await fetch(`${supabaseUrl}/rest/v1/user_flags?user_email=eq.${encodeURIComponent(user_email)}`, {
      method: "PATCH",
      headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ is_banned: false }),
    });
    return NextResponse.json({ ok: true });
  }

  if (action === "delete_user_submissions") {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/submissions?submitter_email=eq.${encodeURIComponent(user_email)}`,
      {
        method: "DELETE",
        headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
      }
    );
    return NextResponse.json({ ok: res.ok });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
