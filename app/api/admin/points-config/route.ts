import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
export const dynamic = "force-dynamic";

// Default point values — in production these could be stored in DB
const DEFAULT_POINTS: Record<string, number> = {
  submit_spotting: 10,
  submit_spotting_with_plate: 25,
  submit_spotting_with_vin: 40,
  submit_spotting_with_both: 55,
  first_spotting_of_chassis: 100,
  identify_vin: 50,
  add_numberplate: 15,
  add_registry_field: 20,
  ghost_car_found: 500,
  photo_verified: 5,
  model_suggestion_approved: 25,
};

const h = () => ({
  apikey: process.env.SUPABASE_SERVICE_KEY!,
  Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY!}`,
  "Content-Type": "application/json",
});

export async function GET(req: NextRequest) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = process.env.SUPABASE_URL;
  if (!url) return NextResponse.json(DEFAULT_POINTS);

  const res = await fetch(`${url}/rest/v1/points_config?select=action,points`, {
    headers: h(), cache: "no-store",
  });
  if (res.ok) {
    const rows: { action: string; points: number }[] = await res.json();
    const config = { ...DEFAULT_POINTS };
    for (const r of rows) config[r.action] = r.points;
    return NextResponse.json(config);
  }
  return NextResponse.json(DEFAULT_POINTS);
}

export async function PATCH(req: NextRequest) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { action, points } = await req.json();
  // Log the change; actual enforcement happens in sightings route
  const url = process.env.SUPABASE_URL;
  if (url) {
    await fetch(`${url}/rest/v1/admin_audit_log`, {
      method: "POST",
      headers: { ...h(), Prefer: "return=minimal" },
      body: JSON.stringify({ admin_email: "admin", action: "POINTS_CONFIG_CHANGED", details: { action, points } }),
    }).catch(() => {});
  }
  return NextResponse.json({ ok: true, action, points });
}
