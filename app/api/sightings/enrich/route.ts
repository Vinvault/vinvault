import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";

const POINT_VALUES: Record<string, number> = {
  identify_vin: 50,
  add_numberplate: 15,
  add_registry_field: 20,
};

function sanitize(v: unknown): string {
  if (typeof v !== "string") return "";
  return v.trim().slice(0, 500).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
}

export async function PATCH(request: NextRequest) {
  const supaUrl = process.env.SUPABASE_URL;
  const supaKey = process.env.SUPABASE_SERVICE_KEY;
  if (!supaUrl || !supaKey) return NextResponse.json({ error: "Config" }, { status: 500 });

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Bad request" }, { status: 400 }); }

  const id = sanitize(body.id);
  const userEmail = sanitize(body.user_email);
  const action = sanitize(body.action);
  if (!id || !userEmail || !(action in POINT_VALUES)) {
    return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
  }

  const h = { apikey: supaKey, Authorization: `Bearer ${supaKey}`, "Content-Type": "application/json" };

  // Build patch
  const patch: Record<string, string | null> = {};
  if (body.numberplate_seen) patch.numberplate_seen = sanitize(body.numberplate_seen);
  if (body.chassis_number) patch.chassis_number = sanitize(body.chassis_number).toUpperCase();
  if (body.registry_entry_id) patch.registry_entry_id = sanitize(body.registry_entry_id);

  if (Object.keys(patch).length === 0) return NextResponse.json({ error: "Nothing to update" }, { status: 400 });

  // If VIN being added, also try to link registry entry
  if (patch.chassis_number && !patch.registry_entry_id) {
    const regRes = await fetch(
      `${supaUrl}/rest/v1/submissions?chassis_number=eq.${encodeURIComponent(patch.chassis_number)}&status=eq.approved&limit=1`,
      { headers: h, cache: "no-store" }
    );
    if (regRes.ok) {
      const reg = await regRes.json();
      if (reg.length > 0) patch.registry_entry_id = reg[0].id;
    }
  }

  const patchRes = await fetch(`${supaUrl}/rest/v1/sightings?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { ...h, Prefer: "return=minimal" },
    body: JSON.stringify(patch),
  });
  if (!patchRes.ok) {
    return NextResponse.json({ error: "Failed to update sighting" }, { status: 500 });
  }

  const points = POINT_VALUES[action];

  // Log and award points
  await fetch(`${supaUrl}/rest/v1/points_log`, {
    method: "POST",
    headers: { ...h, Prefer: "return=minimal" },
    body: JSON.stringify({ user_email: userEmail, action, points, reference_id: id }),
  }).catch(() => {});

  const profileRes = await fetch(`${supaUrl}/rest/v1/spotter_profiles?user_email=eq.${encodeURIComponent(userEmail)}&limit=1`, {
    headers: h, cache: "no-store",
  });
  const profiles = profileRes.ok ? await profileRes.json() : [];

  if (profiles.length > 0) {
    const p = profiles[0];
    await fetch(`${supaUrl}/rest/v1/spotter_profiles?user_email=eq.${encodeURIComponent(userEmail)}`, {
      method: "PATCH",
      headers: { ...h, Prefer: "return=minimal" },
      body: JSON.stringify({ total_points: (p.total_points || 0) + points }),
    }).catch(() => {});
  }

  return NextResponse.json({ ok: true, points_awarded: points });
}
