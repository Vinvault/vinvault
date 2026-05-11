import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

const h = () => ({
  apikey: process.env.SUPABASE_SERVICE_KEY!,
  Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY!}`,
  "Content-Type": "application/json",
});

async function getUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function GET() {
  const user = await getUser();
  if (!user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = process.env.SUPABASE_URL;
  if (!url) return NextResponse.json([]);

  const res = await fetch(
    `${url}/rest/v1/user_garage?user_email=eq.${encodeURIComponent(user.email)}&order=created_at.desc`,
    { headers: { ...h(), Prefer: "return=representation" }, cache: "no-store" }
  );
  if (!res.ok) return NextResponse.json([]);
  const cars = await res.json();

  // Attach cover photos
  const ids = cars.map((c: { id: string }) => c.id);
  if (ids.length === 0) return NextResponse.json(cars);

  const photosRes = await fetch(
    `${url}/rest/v1/garage_photos?garage_car_id=in.(${ids.join(",")})&is_cover=eq.true`,
    { headers: h(), cache: "no-store" }
  );
  const photos = photosRes.ok ? await photosRes.json() : [];
  const coverMap: Record<string, string> = {};
  for (const p of photos) coverMap[p.garage_car_id] = p.photo_url;

  return NextResponse.json(cars.map((c: { id: string }) => ({ ...c, cover_photo: coverMap[c.id] ?? null })));
}

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = process.env.SUPABASE_URL;
  if (!url) return NextResponse.json({ error: "Server error" }, { status: 500 });

  const body = await req.json();
  const car = {
    user_email: user.email,
    user_id: user.id,
    make_name: (body.make_name || "").trim(),
    model: (body.model || "").trim(),
    submodel: body.submodel?.trim() || null,
    year: body.year ? Number(body.year) : null,
    color: body.color?.trim() || null,
    vin: body.vin?.trim() || null,
    mileage: body.mileage ? Number(body.mileage) : null,
    mileage_unit: body.mileage_unit || "km",
    purchase_date: body.purchase_date || null,
    purchase_price: body.purchase_price ? Number(body.purchase_price) : null,
    numberplate: body.numberplate?.trim() || null,
    notes: body.notes?.trim() || null,
    status: body.status || "current",
    make_id: body.make_id || null,
    unverified_make: body.unverified_make?.trim() || null,
  };

  if (!car.make_name || !car.model) {
    return NextResponse.json({ error: "Make and model required" }, { status: 400 });
  }

  const res = await fetch(`${url}/rest/v1/user_garage`, {
    method: "POST",
    headers: { ...h(), Prefer: "return=representation" },
    body: JSON.stringify(car),
  });
  if (!res.ok) return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  const [created] = await res.json();
  return NextResponse.json(created, { status: 201 });
}
