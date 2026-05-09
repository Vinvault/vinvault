import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
export const dynamic = "force-dynamic";

const SB = () => ({ apikey: process.env.SUPABASE_SERVICE_KEY!, Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY!}` });

async function count(table: string, filter = ""): Promise<number> {
  const url = process.env.SUPABASE_URL;
  if (!url) return 0;
  const res = await fetch(`${url}/rest/v1/${table}?select=id${filter ? "&" + filter : ""}`, {
    headers: { ...SB(), "Content-Type": "application/json", Prefer: "count=exact", Range: "0-0" },
    cache: "no-store",
  });
  const ct = res.headers.get("content-range") || "0/0";
  return parseInt(ct.split("/")[1] || "0", 10);
}

export async function GET(req: NextRequest) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [
    totalUsers, bannedUsers,
    totalSightings, pendingSightings,
    totalSubmissions, pendingSubmissions, approvedSubmissions,
    totalSpotters, modelSuggestions,
  ] = await Promise.all([
    count("user_profiles"),
    count("user_profiles", "is_banned=eq.true"),
    count("sightings"),
    count("sightings", "status=eq.pending"),
    count("submissions"),
    count("submissions", "status=eq.pending"),
    count("submissions", "status=eq.approved"),
    count("spotter_profiles"),
    count("sightings", "needs_model_review=eq.true"),
  ]);

  // Recent audit log
  const url = process.env.SUPABASE_URL!;
  const auditRes = await fetch(`${url}/rest/v1/admin_audit_log?order=created_at.desc&limit=20`, {
    headers: SB(), cache: "no-store",
  });
  const recentAudit = auditRes.ok ? await auditRes.json() : [];

  return NextResponse.json({
    totalUsers, bannedUsers,
    totalSightings, pendingSightings,
    totalSubmissions, pendingSubmissions, approvedSubmissions,
    totalSpotters, modelSuggestions,
    recentAudit,
  });
}
