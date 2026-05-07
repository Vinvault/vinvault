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

function calcConfidence(data: {
  hasPhoto: boolean;
  chassisVisible: boolean;
  hasPlate: boolean;
  hasNotes: boolean;
  isLoggedIn: boolean;
}): number {
  return (data.hasPhoto ? 40 : 0) +
    (data.chassisVisible ? 30 : 0) +
    (data.hasPlate ? 15 : 0) +
    (data.hasNotes ? 10 : 0) +
    (data.isLoggedIn ? 5 : 0);
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

export async function GET(request: NextRequest) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return NextResponse.json({ error: "Config" }, { status: 500 });

  const { searchParams } = new URL(request.url);
  const chassis = searchParams.get("chassis");
  const status = searchParams.get("status");
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200);
  const country = searchParams.get("country");

  let query = `${url}/rest/v1/sightings?order=spotted_at.desc&limit=${limit}`;
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

  const chassis = sanitize(body.chassis_number);
  const spotterEmail = sanitize(body.spotter_email);
  const locationName = sanitize(body.location_name);
  const country = sanitize(body.country);
  const photoUrl = sanitize(body.photo_url);
  const lat = parseFloat(String(body.latitude));
  const lng = parseFloat(String(body.longitude));
  const spottedAt = sanitize(body.spotted_at);

  if (!chassis || !spotterEmail || !locationName || !country || !photoUrl || isNaN(lat) || isNaN(lng) || !spottedAt) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Nearby duplicate check
  if (!body.confirmed_duplicate) {
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

  const chassisVisible = body.chassis_visible === true;
  const hasPlate = Boolean(sanitize(body.numberplate_seen));
  const hasNotes = Boolean(sanitize(body.notes));
  const isLoggedIn = Boolean(spotterEmail);

  const confidence = calcConfidence({ hasPhoto: true, chassisVisible, hasPlate, hasNotes, isLoggedIn });
  const status = statusFromScore(confidence);

  const row = {
    chassis_number: chassis,
    spotter_email: spotterEmail,
    spotted_at: spottedAt,
    latitude: lat,
    longitude: lng,
    location_name: locationName,
    country,
    photo_url: photoUrl,
    numberplate_seen: sanitize(body.numberplate_seen) || null,
    notes: sanitize(body.notes) || null,
    status,
    confidence_score: confidence,
    verified_by: [],
    flag_count: 0,
    is_duplicate_flag: false,
    nearby_sighting_id: body.nearby_sighting_id ? sanitize(body.nearby_sighting_id as string) : null,
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

  // Notify admins if chassis is not in the vehicles registry
  try {
    const vehicleCheckRes = await fetch(
      `${url}/rest/v1/vehicles?chassis_number=eq.${encodeURIComponent(chassis)}&limit=1`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: "no-store" }
    );
    if (vehicleCheckRes.ok) {
      const vehicles = await vehicleCheckRes.json();
      if (vehicles.length === 0) {
        await fetch(`${url}/rest/v1/submissions`, {
          method: "POST",
          headers: {
            apikey: key,
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify({
            chassis_number: chassis,
            submitter_email: spotterEmail,
            source: "unknown_spotted",
            status: "needs_review",
            provenance: `Spotted at ${locationName}, ${country} on ${spottedAt}`,
          }),
        });
      }
    }
  } catch { /* non-fatal */ }

  return NextResponse.json({ success: true, sighting: inserted[0], confidence, status, auto_approved: status === "approved" }, { status: 201 });
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
