import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";

function sanitize(v: unknown): string {
  if (typeof v !== "string") return "";
  return v.trim().slice(0, 1000).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
}

export async function GET(request: NextRequest) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return NextResponse.json({ error: "Config" }, { status: 500 });

  const { searchParams } = new URL(request.url);
  const country = searchParams.get("country");
  const type = searchParams.get("type");
  const approved = searchParams.get("approved") !== "false";

  let query = `${url}/rest/v1/vin_lookup_services?order=country_name.asc`;
  if (approved) query += `&is_approved=eq.true`;
  if (country) query += `&country_code=eq.${encodeURIComponent(country)}`;
  if (type) query += `&service_type=eq.${encodeURIComponent(type)}`;

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

  const name = sanitize(body.service_name);
  const country_name = sanitize(body.country_name);
  const country_code = sanitize(body.country_code);
  const service_url = sanitize(body.service_url);
  const description = sanitize(body.description);
  const submitted_by = sanitize(body.submitted_by);

  if (!name || !country_name || !country_code || !service_url) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const row = {
    service_name: name,
    country_name,
    country_code: country_code.toUpperCase().slice(0, 3),
    service_url,
    description: description || null,
    service_type: sanitize(body.service_type) || "government",
    is_free: body.is_free === true,
    latitude: parseFloat(String(body.latitude)) || null,
    longitude: parseFloat(String(body.longitude)) || null,
    submitted_by: submitted_by || null,
    is_approved: false,
    is_pre_populated: false,
  };

  const insertRes = await fetch(`${url}/rest/v1/vin_lookup_services`, {
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
    console.error("VIN lookup insert error:", errText);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return NextResponse.json({ error: "Config" }, { status: 500 });

  const cookie = request.headers.get("cookie") || "";
  if (!cookie.includes("vv_admin=")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, is_approved } = await request.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const res = await fetch(`${url}/rest/v1/vin_lookup_services?id=eq.${id}`, {
    method: "PATCH",
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ is_approved }),
  });
  return NextResponse.json({ ok: res.ok });
}
