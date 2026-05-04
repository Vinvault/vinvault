import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ number: string }> }
) {
  const { number } = await params;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return NextResponse.json({ error: "Service unavailable." }, { status: 503 });

  const res = await fetch(
    `${url}/rest/v1/submissions?chassis_number=eq.${encodeURIComponent(number)}&status=eq.approved&limit=1`,
    { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: "no-store" }
  );
  if (!res.ok) return NextResponse.json({ error: "Database error." }, { status: 502 });
  const data = await res.json();
  if (!data?.length) return NextResponse.json({ error: "Chassis not found." }, { status: 404 });

  const car = data[0];
  return NextResponse.json({
    chassis_number: car.chassis_number,
    make: "Ferrari",
    model: "288 GTO",
    engine_number: car.engine_number || null,
    gearbox_number: car.gearbox_number || null,
    production_date: car.production_date || null,
    original_market: car.original_market || null,
    exterior_color: car.exterior_color || null,
    interior_color: car.interior_color || null,
    matching_numbers: car.matching_numbers || null,
    condition_score: car.condition_score || null,
    has_service_history: car.has_service_history || null,
    has_books: car.has_books || null,
    has_toolkit: car.has_toolkit || null,
    provenance: car.provenance || null,
    registry_url: `https://www.vinvault.net/ferrari/288-gto/${car.chassis_number}`,
    verified: true,
    created_at: car.created_at,
  }, {
    headers: { "Access-Control-Allow-Origin": "*", "Cache-Control": "public, max-age=300" },
  });
}
