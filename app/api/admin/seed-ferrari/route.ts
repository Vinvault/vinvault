import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
export const dynamic = "force-dynamic";

const REGISTRY_CARS = [
  {
    chassis: "ZFFPA16B000050001",
    exterior_color: "Rosso Corsa",
    interior_color: "Nero",
    original_market: "Italy",
    engine_number: "26921",
    production_date: "1985-03-15",
    svgBg: "#B50000", svgText: "#FFFFFF",
    provenance: "Delivered new to a private collector in Modena, Italy. Matching numbers throughout.",
  },
  {
    chassis: "ZFFPA16B000050003",
    exterior_color: "Giallo Modena",
    interior_color: "Cuoio",
    original_market: "Germany",
    engine_number: "26927",
    production_date: "1985-04-02",
    svgBg: "#C8A000", svgText: "#1A1A1A",
    provenance: "Sold new through Ferrari AG Munich to a private collector. Full service history.",
  },
  {
    chassis: "ZFFPA16B000050005",
    exterior_color: "Grigio Titanio",
    interior_color: "Nero",
    original_market: "United States",
    engine_number: "26933",
    production_date: "1985-05-10",
    svgBg: "#5A5A5A", svgText: "#FFFFFF",
    provenance: "US-spec car, delivered to Algar Ferrari, Philadelphia. Federalised at import.",
  },
  {
    chassis: "ZFFPA16B000050007",
    exterior_color: "Blu Pozzi",
    interior_color: "Beige",
    original_market: "United Kingdom",
    engine_number: "26939",
    production_date: "1985-06-20",
    svgBg: "#1A3A8A", svgText: "#FFFFFF",
    provenance: "Supplied new to Maranello Concessionaires, UK. Shown at London Motor Show 1985.",
  },
  {
    chassis: "ZFFPA16B000050009",
    exterior_color: "Bianco Fuji",
    interior_color: "Rosso",
    original_market: "Switzerland",
    engine_number: "26945",
    production_date: "1985-07-08",
    svgBg: "#D8D0C0", svgText: "#1A1A1A",
    provenance: "Delivered to Emil Frey AG, Zurich. One of very few Bianco examples produced.",
  },
] as const;

const SPOTTING_CARS = [
  {
    model_name: "488 GTB",
    color: "Rosso Corsa",
    svgBg: "#B50000", svgText: "#FFFFFF",
    location_name: "Monte Carlo, Monaco",
    country: "Monaco",
    lat: 43.7384, lng: 7.4246,
    numberplate: "MC 4881",
    notes: "Spotted outside Casino de Monte-Carlo. Full Capristo exhaust — incredible sound.",
  },
  {
    model_name: "F40",
    color: "Rosso Ferrari",
    svgBg: "#990000", svgText: "#FFFFFF",
    location_name: "Maranello, Italy",
    country: "Italy",
    lat: 44.5292, lng: 10.8636,
    numberplate: "MO F40 85",
    notes: "Original condition F40 near the Ferrari factory. Never restored, stunning patina.",
  },
  {
    model_name: "SF90 Stradale",
    color: "Giallo Modena",
    svgBg: "#C8A000", svgText: "#1A1A1A",
    location_name: "Monte Carlo, Monaco",
    country: "Monaco",
    lat: 43.7390, lng: 7.4275,
    numberplate: "MC SF90X",
    notes: "Brand new SF90 in Giallo — an unusual and striking colour choice.",
  },
  {
    model_name: "LaFerrari",
    color: "Nero Daytona",
    svgBg: "#111111", svgText: "#FFFFFF",
    location_name: "Cannes, France",
    country: "France",
    lat: 43.5528, lng: 7.0174,
    numberplate: "06 LFR 001",
    notes: "One of only 499 LaFerraris ever built. Completely stock specification.",
  },
  {
    model_name: "F12 Berlinetta",
    color: "Bianco Avus",
    svgBg: "#E8E0D0", svgText: "#1A1A1A",
    location_name: "Geneva, Switzerland",
    country: "Switzerland",
    lat: 46.2044, lng: 6.1432,
    numberplate: "GE 218F12",
    notes: "White F12 near the Palexpo — rare colour on this model.",
  },
] as const;

const MODEL_DEFS = [
  { model: "488 GTB", body_style: "Coupe", start: 2015, end: 2020 },
  { model: "F40", body_style: "Coupe", start: 1987, end: 1992 },
  { model: "SF90 Stradale", body_style: "Coupe", start: 2019, end: null },
  { model: "LaFerrari", body_style: "Coupe", start: 2013, end: 2016 },
  { model: "F12 Berlinetta", body_style: "Coupe", start: 2012, end: 2017 },
] as const;

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function makeSvg(title: string, subtitle: string, footer: string, bg: string, tc: string): string {
  const overlay = tc === "#FFFFFF" ? "rgba(0,0,0,0.65)" : "rgba(255,255,255,0.72)";
  return `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
<rect width="800" height="600" fill="${bg}"/>
<ellipse cx="400" cy="250" rx="310" ry="130" fill="rgba(0,0,0,0.08)"/>
<rect x="0" y="420" width="800" height="180" fill="${overlay}"/>
<text x="400" y="482" fill="${tc}" font-size="29" font-family="Georgia,serif" text-anchor="middle" font-weight="bold">${esc(title)}</text>
<text x="400" y="520" fill="${tc}" font-size="19" font-family="Verdana,sans-serif" text-anchor="middle">${esc(subtitle)}</text>
<text x="400" y="554" fill="${tc}" font-size="15" font-family="Verdana,sans-serif" text-anchor="middle" opacity="0.75">${esc(footer)}</text>
<text x="792" y="594" fill="${tc}" font-size="9" font-family="Verdana,sans-serif" text-anchor="end" opacity="0.28">VinVault</text>
</svg>`;
}

export async function GET() {
  return NextResponse.json({ message: "POST to this endpoint (admin auth required) to seed 5 Ferrari 288 GTO registry entries and 5 Ferrari spottings." });
}

export async function POST(req: NextRequest) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  const pubUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url || !key || !pubUrl) return NextResponse.json({ error: "Config missing" }, { status: 500 });
  if (!isAdminAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const H = { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
  const results: string[] = [];
  const errors: string[] = [];

  // ── 1. Get or create Ferrari make ──────────────────────────────────────────
  let ferrariMakeId = "";
  {
    const r = await fetch(`${url}/rest/v1/makes?name=eq.Ferrari&limit=1`, { headers: H, cache: "no-store" });
    const data = r.ok ? await r.json() : [];
    if (data.length > 0) {
      ferrariMakeId = data[0].id;
      results.push(`Make: Ferrari found (${ferrariMakeId})`);
    } else {
      const cr = await fetch(`${url}/rest/v1/makes`, {
        method: "POST",
        headers: { ...H, Prefer: "return=representation" },
        body: JSON.stringify({ name: "Ferrari", slug: "ferrari", country: "Italy", founded_year: 1947 }),
      });
      if (!cr.ok) {
        const e = await cr.text();
        errors.push(`Failed to create Ferrari make: ${e}`);
        return NextResponse.json({ results, errors, ok: false });
      }
      const [mk] = await cr.json();
      ferrariMakeId = mk.id;
      results.push(`Make: Ferrari created (${ferrariMakeId})`);
    }
  }

  // ── 2. Get or create Ferrari models ────────────────────────────────────────
  const modelIds: Record<string, string> = {};
  for (const md of MODEL_DEFS) {
    const r = await fetch(
      `${url}/rest/v1/models?make=eq.Ferrari&model=eq.${encodeURIComponent(md.model)}&limit=1`,
      { headers: H, cache: "no-store" },
    );
    const data = r.ok ? await r.json() : [];
    if (data.length > 0) {
      modelIds[md.model] = data[0].id;
      results.push(`Model: ${md.model} found`);
    } else {
      const cr = await fetch(`${url}/rest/v1/models`, {
        method: "POST",
        headers: { ...H, Prefer: "return=representation" },
        body: JSON.stringify({
          make: "Ferrari",
          model: md.model,
          full_model_name: `Ferrari ${md.model}`,
          body_style: md.body_style,
          production_start_year: md.start,
          production_end_year: md.end ?? null,
        }),
      });
      if (!cr.ok) {
        errors.push(`Failed to create model ${md.model}: ${await cr.text()}`);
        continue;
      }
      const [m] = await cr.json();
      modelIds[md.model] = m.id;
      results.push(`Model: ${md.model} created`);
    }
  }

  // ── 3. Insert 288 GTO registry entries ────────────────────────────────────
  for (const car of REGISTRY_CARS) {
    const existR = await fetch(
      `${url}/rest/v1/submissions?chassis_number=eq.${car.chassis}&limit=1`,
      { headers: H, cache: "no-store" },
    );
    const existing = existR.ok ? await existR.json() : [];
    if (existing.length > 0) {
      results.push(`Registry: ${car.chassis} already exists — skipped`);
      continue;
    }

    // Upload SVG image to chassis-photos bucket
    const svg = makeSvg(
      `Ferrari 288 GTO — ${car.chassis}`,
      `${car.exterior_color} / ${car.interior_color} Interior`,
      `${car.original_market} · ${car.production_date.slice(0, 7)}`,
      car.svgBg, car.svgText,
    );
    const upR = await fetch(`${url}/storage/v1/object/chassis-photos/${car.chassis}/seed_cover.svg`, {
      method: "POST",
      headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "image/svg+xml", "x-upsert": "true" },
      body: svg,
    });
    if (!upR.ok) {
      errors.push(`Photo upload failed for ${car.chassis}: ${await upR.text()}`);
    } else {
      results.push(`Photo uploaded: chassis-photos/${car.chassis}/seed_cover.svg`);
    }

    // Insert submission (registry entry)
    const subR = await fetch(`${url}/rest/v1/submissions`, {
      method: "POST",
      headers: { ...H, Prefer: "return=representation" },
      body: JSON.stringify({
        chassis_number: car.chassis,
        exterior_color: car.exterior_color,
        interior_color: car.interior_color,
        original_market: car.original_market,
        engine_number: car.engine_number,
        production_date: car.production_date,
        provenance: car.provenance,
        matching_numbers: "Yes",
        condition_score: "4",
        has_service_history: "Yes",
        has_books: "Yes",
        has_toolkit: "Yes",
        status: "approved",
        submitter_email: "seed@vinvault.net",
        source: "VinVault Seed Data",
      }),
    });
    if (!subR.ok) {
      errors.push(`Registry insert failed for ${car.chassis}: ${await subR.text()}`);
    } else {
      results.push(`Registry: ${car.chassis} (${car.exterior_color}) inserted`);
    }
  }

  // ── 4. Insert Ferrari spottings ────────────────────────────────────────────
  const now = Date.now();
  for (let i = 0; i < SPOTTING_CARS.length; i++) {
    const sp = SPOTTING_CARS[i];
    const modelId = modelIds[sp.model_name] ?? null;

    // Upload SVG image to sightings-photos bucket
    const svg = makeSvg(
      `Ferrari ${sp.model_name}`,
      sp.color,
      sp.location_name,
      sp.svgBg, sp.svgText,
    );
    const imgPath = `seed_ferrari_${i + 1}_${now}.svg`;
    const upR = await fetch(`${url}/storage/v1/object/sightings-photos/${imgPath}`, {
      method: "POST",
      headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "image/svg+xml", "x-upsert": "true" },
      body: svg,
    });
    let photoUrl: string;
    if (!upR.ok) {
      errors.push(`Spotting photo upload failed for ${sp.model_name}: ${await upR.text()}`);
      photoUrl = `https://placehold.co/800x600?text=Ferrari+${encodeURIComponent(sp.model_name)}`;
    } else {
      photoUrl = `${pubUrl}/storage/v1/object/public/sightings-photos/${imgPath}`;
      results.push(`Spotting photo uploaded: sightings-photos/${imgPath}`);
    }

    const sgR = await fetch(`${url}/rest/v1/sightings`, {
      method: "POST",
      headers: { ...H, Prefer: "return=representation" },
      body: JSON.stringify({
        make_id: ferrariMakeId,
        model_id: modelId,
        chassis_number: null,
        spotter_email: "seed@vinvault.net",
        spotter_username: "vinvault_seed",
        location_name: sp.location_name,
        country: sp.country,
        spotted_at: new Date(now - i * 86_400_000).toISOString(),
        latitude: sp.lat,
        longitude: sp.lng,
        photo_url: photoUrl,
        photo_urls: [photoUrl],
        numberplate_seen: sp.numberplate,
        notes: sp.notes,
        submodel: null,
        status: "approved",
        confidence_score: 60,
        verified_by: [],
        flag_count: 0,
        is_duplicate_flag: false,
        points_awarded: 25,
        registry_entry_id: null,
        unverified_make: null,
        unverified_model: null,
        needs_model_review: false,
      }),
    });
    if (!sgR.ok) {
      errors.push(`Sighting insert failed for Ferrari ${sp.model_name}: ${await sgR.text()}`);
    } else {
      results.push(`Spotting: Ferrari ${sp.model_name} (${sp.color}) in ${sp.country} inserted`);
    }
  }

  return NextResponse.json({ results, errors, ok: errors.length === 0 });
}
