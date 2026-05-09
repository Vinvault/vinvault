import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
export const dynamic = "force-dynamic";

const h = () => ({
  apikey: process.env.SUPABASE_SERVICE_KEY!,
  Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY!}`,
  "Content-Type": "application/json",
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const url = process.env.SUPABASE_URL;
  if (!url) return NextResponse.json([]);

  // Get user email from id first
  const userRes = await fetch(`${url}/rest/v1/user_profiles?id=eq.${id}&select=email`, { headers: h(), cache: "no-store" });
  const users = userRes.ok ? await userRes.json() : [];
  if (!users.length) return NextResponse.json([]);
  const email = users[0].email;

  const res = await fetch(`${url}/rest/v1/points_log?user_email=eq.${encodeURIComponent(email)}&order=created_at.desc&limit=100`, {
    headers: h(), cache: "no-store",
  });
  return NextResponse.json(res.ok ? await res.json() : []);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const url = process.env.SUPABASE_URL;
  if (!url) return NextResponse.json({ error: "Config" }, { status: 500 });

  const body = await req.json();
  const { points, reason, admin_email } = body;
  if (!points || !reason) return NextResponse.json({ error: "points and reason required" }, { status: 400 });

  // Get user
  const userRes = await fetch(`${url}/rest/v1/user_profiles?id=eq.${id}&select=email,total_points`, { headers: h(), cache: "no-store" });
  const users = userRes.ok ? await userRes.json() : [];
  if (!users.length) return NextResponse.json({ error: "User not found" }, { status: 404 });
  const { email, total_points } = users[0];

  const newTotal = Math.max(0, (total_points || 0) + points);

  // Update total_points and insert points_log entry
  await Promise.all([
    fetch(`${url}/rest/v1/user_profiles?id=eq.${id}`, {
      method: "PATCH",
      headers: { ...h(), Prefer: "return=minimal" },
      body: JSON.stringify({ total_points: newTotal, updated_at: new Date().toISOString() }),
    }),
    fetch(`${url}/rest/v1/points_log`, {
      method: "POST",
      headers: { ...h(), Prefer: "return=minimal" },
      body: JSON.stringify({ user_email: email, action: points > 0 ? "admin_award" : "admin_remove", points, awarded_by: admin_email || "admin", details: { reason } }),
    }),
    fetch(`${url}/rest/v1/admin_audit_log`, {
      method: "POST",
      headers: { ...h(), Prefer: "return=minimal" },
      body: JSON.stringify({ admin_email: admin_email || "admin", action: points > 0 ? "POINTS_AWARDED" : "POINTS_REMOVED", target_user_email: email, details: { points, reason, new_total: newTotal } }),
    }),
  ]);

  return NextResponse.json({ ok: true, new_total: newTotal });
}
