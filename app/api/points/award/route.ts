import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";

const POINT_VALUES: Record<string, number> = {
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
};

function sanitize(v: unknown): string {
  if (typeof v !== "string") return "";
  return v.trim().slice(0, 500).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
}

export async function POST(request: NextRequest) {
  const supaUrl = process.env.SUPABASE_URL;
  const supaKey = process.env.SUPABASE_SERVICE_KEY;
  if (!supaUrl || !supaKey) return NextResponse.json({ error: "Config" }, { status: 500 });

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Bad request" }, { status: 400 }); }

  const userEmail = sanitize(body.user_email);
  const action = sanitize(body.action);
  const referenceId = body.reference_id ? sanitize(body.reference_id) : null;

  if (!userEmail || !action) return NextResponse.json({ error: "user_email and action required" }, { status: 400 });
  if (!(action in POINT_VALUES)) return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });

  const points = POINT_VALUES[action];
  const h = { apikey: supaKey, Authorization: `Bearer ${supaKey}`, "Content-Type": "application/json" };

  // Log to points_log
  const logRes = await fetch(`${supaUrl}/rest/v1/points_log`, {
    method: "POST",
    headers: { ...h, Prefer: "return=minimal" },
    body: JSON.stringify({ user_email: userEmail, action, points, reference_id: referenceId || null }),
  });
  if (!logRes.ok) {
    const errText = await logRes.text();
    console.error("points_log insert error:", errText);
    return NextResponse.json({ error: "Failed to log points" }, { status: 500 });
  }

  // Fetch current profile
  const profileRes = await fetch(`${supaUrl}/rest/v1/spotter_profiles?user_email=eq.${encodeURIComponent(userEmail)}&limit=1`, {
    headers: h, cache: "no-store",
  });
  const profiles = profileRes.ok ? await profileRes.json() : [];

  if (profiles.length > 0) {
    const current = profiles[0];
    const newTotal = (current.total_points || 0) + points;
    const extraFields: Record<string, unknown> = {};
    if (action.startsWith("submit_spotting")) {
      extraFields.total_sightings = (current.total_sightings || 0) + 1;
    }
    if (action === "submit_spotting_with_vin" || action === "submit_spotting_with_both" || action === "identify_vin") {
      extraFields.verified_sightings = (current.verified_sightings || 0) + 1;
    }
    await fetch(`${supaUrl}/rest/v1/spotter_profiles?user_email=eq.${encodeURIComponent(userEmail)}`, {
      method: "PATCH",
      headers: { ...h, Prefer: "return=minimal" },
      body: JSON.stringify({ total_points: newTotal, ...extraFields }),
    });
  } else {
    // Create profile if missing
    await fetch(`${supaUrl}/rest/v1/spotter_profiles`, {
      method: "POST",
      headers: { ...h, Prefer: "return=minimal" },
      body: JSON.stringify({ user_email: userEmail, username: userEmail.split("@")[0], total_points: points, total_sightings: 1, verified_sightings: 0, trust_level: 1 }),
    });
  }

  return NextResponse.json({ ok: true, points_awarded: points, action });
}
