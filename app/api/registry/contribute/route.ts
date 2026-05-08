import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";

const ALLOWED_FIELDS = ["exterior_color", "interior_color", "original_market", "production_date", "engine_number", "provenance"] as const;
type AllowedField = typeof ALLOWED_FIELDS[number];

function sanitize(v: unknown): string {
  if (typeof v !== "string") return "";
  return v.trim().slice(0, 1000).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
}

export async function POST(request: NextRequest) {
  const supaUrl = process.env.SUPABASE_URL;
  const supaKey = process.env.SUPABASE_SERVICE_KEY;
  if (!supaUrl || !supaKey) return NextResponse.json({ error: "Config" }, { status: 500 });

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Bad request" }, { status: 400 }); }

  const chassis = sanitize(body.chassis);
  const field = sanitize(body.field) as AllowedField;
  const value = sanitize(body.value);
  const userEmail = sanitize(body.user_email);
  const username = sanitize(body.username);

  if (!chassis || !field || !value || !userEmail) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (!ALLOWED_FIELDS.includes(field)) {
    return NextResponse.json({ error: "Invalid field" }, { status: 400 });
  }

  const h = { apikey: supaKey, Authorization: `Bearer ${supaKey}`, "Content-Type": "application/json" };

  // Patch the submission directly
  const patchRes = await fetch(
    `${supaUrl}/rest/v1/submissions?chassis_number=eq.${encodeURIComponent(chassis)}&status=eq.approved`,
    {
      method: "PATCH",
      headers: { ...h, Prefer: "return=minimal" },
      body: JSON.stringify({ [field]: value }),
    }
  );
  if (!patchRes.ok) {
    return NextResponse.json({ error: "Failed to update registry" }, { status: 500 });
  }

  const points = 20;

  // Log points
  await fetch(`${supaUrl}/rest/v1/points_log`, {
    method: "POST",
    headers: { ...h, Prefer: "return=minimal" },
    body: JSON.stringify({ user_email: userEmail, action: "add_registry_field", points, reference_id: null }),
  }).catch(() => {});

  // Update spotter profile
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
  } else {
    await fetch(`${supaUrl}/rest/v1/spotter_profiles`, {
      method: "POST",
      headers: { ...h, Prefer: "return=minimal" },
      body: JSON.stringify({ user_email: userEmail, username: username || userEmail.split("@")[0], total_points: points, total_sightings: 0, verified_sightings: 0, trust_level: 1 }),
    }).catch(() => {});
  }

  return NextResponse.json({ ok: true, points_awarded: points });
}
