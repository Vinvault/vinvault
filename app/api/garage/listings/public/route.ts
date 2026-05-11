import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const h = () => ({
  apikey: process.env.SUPABASE_SERVICE_KEY!,
  Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY!}`,
  "Content-Type": "application/json",
});

export async function GET(req: NextRequest) {
  const url = process.env.SUPABASE_URL;
  if (!url) return NextResponse.json([]);

  const sp = new URL(req.url).searchParams;
  const limit = parseInt(sp.get("limit") || "50", 10);
  const includeSold = sp.get("include_sold") === "true";

  let query = `${url}/rest/v1/garage_listings?select=*,user_garage(make_name,model,submodel,year,color,mileage,mileage_unit,vin,cover_photo:garage_photos(photo_url,is_cover))`;
  if (!includeSold) query += `&is_active=eq.true`;
  query += `&order=created_at.desc&limit=${limit}`;

  const res = await fetch(query, { headers: h(), cache: "no-store" });
  if (!res.ok) return NextResponse.json([]);

  const raw = await res.json();

  // Flatten for easier consumption
  const listings = await Promise.all(raw.map(async (l: Record<string, unknown>) => {
    const car = l.user_garage as Record<string, unknown> | null;
    const photos = (car?.cover_photo as Array<{ photo_url: string; is_cover: boolean }>) || [];
    const cover = photos.find((p) => p.is_cover)?.photo_url || photos[0]?.photo_url || null;

    // Get seller username
    const profRes = await fetch(`${url}/rest/v1/spotter_profiles?user_email=eq.${encodeURIComponent(l.user_email as string)}&select=username&limit=1`, {
      headers: h(), cache: "no-store",
    });
    const profs = profRes.ok ? await profRes.json() : [];
    const username = profs[0]?.username || null;

    return {
      id: l.id,
      asking_price: l.asking_price,
      currency: l.currency,
      description: l.description,
      location_city: l.location_city,
      location_country: l.location_country,
      contact_via: l.contact_via,
      is_active: l.is_active,
      expires_at: l.expires_at,
      sold_at: l.sold_at,
      created_at: l.created_at,
      garage_car_id: l.garage_car_id,
      user_email: l.user_email,
      seller_username: username,
      make_name: car?.make_name || null,
      model: car?.model || null,
      submodel: car?.submodel || null,
      year: car?.year || null,
      color: car?.color || null,
      mileage: car?.mileage || null,
      mileage_unit: car?.mileage_unit || "km",
      cover_photo: cover,
    };
  }));

  return NextResponse.json(listings);
}
