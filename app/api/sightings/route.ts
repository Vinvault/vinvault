import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";

const EARTH_RADIUS_KM = 6371;

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function calcConfidence(hasPhoto: boolean, hasPlate: boolean, hasVin: boolean, isLoggedIn: boolean): number {
  return (hasPhoto ? 40 : 0) + (hasVin ? 30 : 0) + (hasPlate ? 15 : 0) + (isLoggedIn ? 5 : 0);
}

function statusFromScore(score: number): string {
  if (score >= 70) return "approved";
  if (score >= 40) return "pending_community";
  return "pending";
}

function sanitize(v: unknown): string {
  if (typeof v !== "string") return "";
  return v.trim().slice(0, 2000).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
}

function pointsAction(hasPlate: boolean, hasVin: boolean): string {
  if (hasPlate && hasVin) return "submit_spotting_with_both";
  if (hasVin) return "submit_spotting_with_vin";
  if (hasPlate) return "submit_spotting_with_plate";
  return "submit_spotting";
}

const POINT_VALUES: Record<string, number> = {
  submit_spotting: 10,
  submit_spotting_with_plate: 25,
  submit_spotting_with_vin: 40,
  submit_spotting_with_both: 55,
};

export async function GET(request: NextRequest) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return NextResponse.json({ error: "Config" }, { status: 500 });

  const { searchParams } = new URL(request.url);
  const chassis = searchParams.get("chassis");
  const status = searchParams.get("status");
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200);
  const country = searchParams.get("country");
  const id = searchParams.get("id");

  let query = `${url}/rest/v1/sightings?order=spotted_at.desc&limit=${limit}`;
  if (id) query += `&id=eq.${encodeURIComponent(id)}`;
  if (chassis) query += `&chassis_number=eq.${encodeURIComponent(chassis)}`;
  if (status === "pending") query += `&status=eq.pending`;
  else if (status) query += `&status=eq.${encodeURIComponent(status)}`;
  else query += `&status=in.(approved,pending_community)`;
  if (country) query += `&country=eq.${encodeURIComponent(country)}`;

  const res = await fetch(query, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
    cache: "no-store",
  });
  if (!res.ok) return NextResponse.json({ error: "DB error" }, { status: 500 });
  return NextResponse.json(await res.json());
}

export async function POST(request: NextRequest) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return NextResponse.json({ error: "Config" }, { status: 500 });

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Bad request" }, { status: 400 }); }

  let makeId = sanitize(body.make_id);
  const makeName = sanitize(body.make_name);
  const modelId = sanitize(body.model_id);

  // If no UUID for make, find or create it by name
  if (!makeId && makeName) {
    const lookupRes = await fetch(
      `${url}/rest/v1/makes?name=eq.${encodeURIComponent(makeName)}&limit=1`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: "no-store" }
    );
    if (lookupRes.ok) {
      const existing = await lookupRes.json();
      if (existing.length > 0) {
        makeId = existing[0].id;
      } else {
        const createRes = await fetch(`${url}/rest/v1/makes`, {
          method: "POST",
          headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "return=representation" },
          body: JSON.stringify({ name: makeName }),
        });
        if (createRes.ok) {
          const created = await createRes.json();
          makeId = created[0]?.id || "";
        }
      }
    }
  }
  const submodel = sanitize(body.submodel);
  const chassis = sanitize(body.chassis_number);
  const unverifiedMake = sanitize(body.unverified_make);
  const unverifiedModel = sanitize(body.unverified_model);
  const needsModelReview = Boolean(body.needs_model_review);
  const spotterEmail = sanitize(body.spotter_email);
  const spotterUsername = sanitize(body.spotter_username);
  const locationName = sanitize(body.location_name);
  const country = sanitize(body.country);
  const photoUrl = sanitize(body.photo_url);
  const photoUrls: string[] = Array.isArray(body.photo_urls)
    ? (body.photo_urls as string[]).map(s => sanitize(s)).filter(Boolean)
    : photoUrl ? [photoUrl] : [];
  const lat = parseFloat(String(body.latitude));
  const lng = parseFloat(String(body.longitude));
  const spottedAt = body.spotted_at ? sanitize(body.spotted_at) : new Date().toISOString();
  const numberplate = sanitize(body.numberplate || body.numberplate_seen);
  const notes = sanitize(body.notes);

  if ((!makeId && !makeName) || !modelId) {
    return NextResponse.json({ error: "Brand and model are required" }, { status: 400 });
  }
  if (!locationName || !country) {
    return NextResponse.json({ error: "Location and country are required" }, { status: 400 });
  }
  if (photoUrls.length === 0) {
    return NextResponse.json({ error: "At least one photo is required" }, { status: 400 });
  }
  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
  }

  const hasPlate = Boolean(numberplate);
  const hasVin = Boolean(chassis);
  const isLoggedIn = Boolean(spotterEmail && spotterEmail !== "anonymous");

  // Nearby duplicate check (only if chassis known)
  if (chassis && !body.confirmed_duplicate) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400_000).toISOString();
    const nearbyRes = await fetch(
      `${url}/rest/v1/sightings?chassis_number=eq.${encodeURIComponent(chassis)}&spotted_at=gte.${thirtyDaysAgo}&status=in.(approved,pending_community)`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: "no-store" }
    );
    if (nearbyRes.ok) {
      const nearby: { id: string; latitude: number; longitude: number; location_name: string }[] = await nearbyRes.json();
      const tooClose = nearby.find(s => haversineKm(lat, lng, Number(s.latitude), Number(s.longitude)) <= 50);
      if (tooClose) {
        return NextResponse.json({
          duplicate_warning: true,
          nearby_id: tooClose.id,
          nearby_location: tooClose.location_name,
          message: `This chassis was already spotted within 50km at "${tooClose.location_name}" in the last 30 days. Is this a new sighting?`,
        }, { status: 409 });
      }
    }
  }

  const confidence = calcConfidence(true, hasPlate, hasVin, isLoggedIn);
  const status = statusFromScore(confidence);
  const action = pointsAction(hasPlate, hasVin);
  const pointsAwarded = POINT_VALUES[action] || 10;

  // Check if this is the first spotting of this chassis
  let isFirstForChassis = false;
  if (chassis) {
    const existingRes = await fetch(
      `${url}/rest/v1/sightings?chassis_number=eq.${encodeURIComponent(chassis)}&limit=1`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: "no-store" }
    );
    if (existingRes.ok) {
      const existing = await existingRes.json();
      isFirstForChassis = existing.length === 0;
    }
  }

  // Find registry entry for this chassis
  let registryEntryId: string | null = null;
  if (chassis) {
    const regRes = await fetch(
      `${url}/rest/v1/submissions?chassis_number=eq.${encodeURIComponent(chassis)}&status=eq.approved&limit=1`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: "no-store" }
    );
    if (regRes.ok) {
      const reg = await regRes.json();
      if (reg.length > 0) registryEntryId = reg[0].id;
    }
  }

  const row: Record<string, unknown> = {
    make_id: makeId,
    model_id: modelId,
    chassis_number: chassis || null,
    spotter_email: spotterEmail || "anonymous",
    spotter_username: spotterUsername || null,
    spotted_at: spottedAt,
    latitude: lat,
    longitude: lng,
    location_name: locationName,
    country,
    photo_url: photoUrls[0] || "",
    photo_urls: photoUrls,
    numberplate_seen: numberplate || null,
    submodel: submodel || null,
    notes: notes || null,
    status,
    confidence_score: confidence,
    verified_by: [],
    flag_count: 0,
    is_duplicate_flag: false,
    points_awarded: pointsAwarded + (isFirstForChassis ? 100 : 0),
    registry_entry_id: registryEntryId,
    unverified_make: unverifiedMake || null,
    unverified_model: unverifiedModel || null,
    needs_model_review: needsModelReview,
  };

  const insertRes = await fetch(`${url}/rest/v1/sightings`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(row),
  });

  if (!insertRes.ok) {
    const errText = await insertRes.text();
    console.error("Sightings insert error:", errText);
    return NextResponse.json({ error: "Failed to save sighting" }, { status: 500 });
  }

  const inserted = await insertRes.json();
  const sightingId = inserted[0]?.id;

  // Award points (non-blocking)
  if (isLoggedIn && spotterEmail) {
    const h = { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };

    // Log to points_log
    await fetch(`${url}/rest/v1/points_log`, {
      method: "POST",
      headers: { ...h, Prefer: "return=minimal" },
      body: JSON.stringify({ user_email: spotterEmail, action, points: pointsAwarded, reference_id: sightingId || null }),
    }).catch(() => {});

    if (isFirstForChassis && chassis) {
      await fetch(`${url}/rest/v1/points_log`, {
        method: "POST",
        headers: { ...h, Prefer: "return=minimal" },
        body: JSON.stringify({ user_email: spotterEmail, action: "first_spotting_of_chassis", points: 100, reference_id: sightingId || null }),
      }).catch(() => {});
    }

    // Update spotter profile
    const profileRes = await fetch(`${url}/rest/v1/spotter_profiles?user_email=eq.${encodeURIComponent(spotterEmail)}&limit=1`, {
      headers: h, cache: "no-store",
    });
    const profiles = profileRes.ok ? await profileRes.json() : [];
    const totalBonus = isFirstForChassis ? 100 : 0;

    if (profiles.length > 0) {
      const p = profiles[0];
      await fetch(`${url}/rest/v1/spotter_profiles?user_email=eq.${encodeURIComponent(spotterEmail)}`, {
        method: "PATCH",
        headers: { ...h, Prefer: "return=minimal" },
        body: JSON.stringify({
          total_points: (p.total_points || 0) + pointsAwarded + totalBonus,
          total_sightings: (p.total_sightings || 0) + 1,
        }),
      }).catch(() => {});
    } else {
      await fetch(`${url}/rest/v1/spotter_profiles`, {
        method: "POST",
        headers: { ...h, Prefer: "return=minimal" },
        body: JSON.stringify({
          user_email: spotterEmail,
          username: spotterUsername || spotterEmail.split("@")[0],
          total_points: pointsAwarded + totalBonus,
          total_sightings: 1,
          verified_sightings: 0,
          trust_level: 1,
        }),
      }).catch(() => {});
    }
  }

  const totalPointsAwarded = pointsAwarded + (isFirstForChassis ? 100 : 0);

  return NextResponse.json({
    success: true,
    sighting: inserted[0],
    confidence,
    status,
    auto_approved: status === "approved",
    points_awarded: totalPointsAwarded,
    first_spotting_bonus: isFirstForChassis,
  }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return NextResponse.json({ error: "Config" }, { status: 500 });

  const cookie = request.headers.get("cookie") || "";
  if (!cookie.includes("vv_admin=")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, status } = await request.json();
  if (!id || !status) return NextResponse.json({ error: "Missing id or status" }, { status: 400 });

  const res = await fetch(`${url}/rest/v1/sightings?id=eq.${id}`, {
    method: "PATCH",
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  return NextResponse.json({ ok: res.ok });
}
