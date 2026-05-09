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

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const url = process.env.SUPABASE_URL;
  if (!url) return NextResponse.json({ error: "Config" }, { status: 500 });

  const [userRes, spottingsRes, submissionsRes, auditRes] = await Promise.all([
    fetch(`${url}/rest/v1/user_profiles?id=eq.${id}`, { headers: h(), cache: "no-store" }),
    fetch(`${url}/rest/v1/sightings?spotter_email=eq.${encodeURIComponent("")}&order=created_at.desc&limit=50`, { headers: h(), cache: "no-store" }),
    fetch(`${url}/rest/v1/submissions?order=created_at.desc&limit=50`, { headers: h(), cache: "no-store" }),
    fetch(`${url}/rest/v1/admin_audit_log?order=created_at.desc&limit=50`, { headers: h(), cache: "no-store" }),
  ]);

  const users = userRes.ok ? await userRes.json() : [];
  if (!users.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const user = users[0];

  // Load spottings and submissions for this user
  const [spotRes, subRes, audRes] = await Promise.all([
    fetch(`${url}/rest/v1/sightings?spotter_email=eq.${encodeURIComponent(user.email)}&order=created_at.desc&limit=50`, { headers: h(), cache: "no-store" }),
    fetch(`${url}/rest/v1/submissions?submitter_email=eq.${encodeURIComponent(user.email)}&order=created_at.desc&limit=50`, { headers: h(), cache: "no-store" }),
    fetch(`${url}/rest/v1/admin_audit_log?target_user_email=eq.${encodeURIComponent(user.email)}&order=created_at.desc&limit=50`, { headers: h(), cache: "no-store" }),
  ]);

  return NextResponse.json({
    user,
    spottings: spotRes.ok ? await spotRes.json() : [],
    submissions: subRes.ok ? await subRes.json() : [],
    auditLog: audRes.ok ? await audRes.json() : [],
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const url = process.env.SUPABASE_URL;
  if (!url) return NextResponse.json({ error: "Config" }, { status: 500 });

  const body = await req.json();
  const { admin_email, action, ...updates } = body;

  // Prevent modifying protected users for dangerous actions
  if (action === "USER_BANNED" || action === "ROLE_CHANGED") {
    const checkRes = await fetch(`${url}/rest/v1/user_profiles?id=eq.${id}&select=is_protected,email`, { headers: h(), cache: "no-store" });
    const rows = checkRes.ok ? await checkRes.json() : [];
    if (rows[0]?.is_protected && (action === "ROLE_CHANGED" || action === "USER_BANNED")) {
      return NextResponse.json({ error: "Protected user cannot be modified" }, { status: 403 });
    }
  }

  updates.updated_at = new Date().toISOString();
  const res = await fetch(`${url}/rest/v1/user_profiles?id=eq.${id}`, {
    method: "PATCH",
    headers: { ...h(), Prefer: "return=representation" },
    body: JSON.stringify(updates),
  });

  if (res.ok) {
    const updated = await res.json();
    await logAudit(admin_email || "admin", action || "USER_UPDATED", updated[0]?.email || null, updates);
    return NextResponse.json({ ok: true, user: updated[0] });
  }
  return NextResponse.json({ error: await res.text() }, { status: 500 });
}
