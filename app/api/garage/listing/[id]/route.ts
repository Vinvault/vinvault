import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const h = () => ({
  apikey: process.env.SUPABASE_SERVICE_KEY!,
  Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY!}`,
  "Content-Type": "application/json",
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const url = process.env.SUPABASE_URL;
  if (!url) return NextResponse.json({ error: "Server error" }, { status: 500 });

  const res = await fetch(`${url}/rest/v1/garage_listings?id=eq.${encodeURIComponent(id)}&limit=1`, {
    headers: h(), cache: "no-store",
  });
  if (!res.ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const listings = await res.json();
  if (!listings[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const l = listings[0];

  // Fetch car details
  const carRes = await fetch(`${url}/rest/v1/user_garage?id=eq.${l.garage_car_id}&limit=1`, {
    headers: h(), cache: "no-store",
  });
  const cars = carRes.ok ? await carRes.json() : [];
  const car = cars[0] ?? {};

  // Fetch photos
  const photosRes = await fetch(`${url}/rest/v1/garage_photos?garage_car_id=eq.${l.garage_car_id}&is_public=eq.true&order=is_cover.desc,uploaded_at.asc`, {
    headers: h(), cache: "no-store",
  });
  const photos = photosRes.ok ? await photosRes.json() : [];

  // Fetch seller username
  const profRes = await fetch(`${url}/rest/v1/spotter_profiles?user_email=eq.${encodeURIComponent(l.user_email)}&select=username&limit=1`, {
    headers: h(), cache: "no-store",
  });
  const profs = profRes.ok ? await profRes.json() : [];

  return NextResponse.json({
    ...l,
    make_name: car.make_name,
    model: car.model,
    submodel: car.submodel,
    year: car.year,
    color: car.color,
    mileage: car.mileage,
    mileage_unit: car.mileage_unit,
    vin: car.vin,
    cover_photo: photos.find((p: { is_cover: boolean; photo_url: string }) => p.is_cover)?.photo_url || photos[0]?.photo_url || null,
    photos,
    seller_username: profs[0]?.username || null,
  });
}
