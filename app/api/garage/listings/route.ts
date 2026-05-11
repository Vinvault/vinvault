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

  const url = process.env.SUPABASE_URL!;
  const res = await fetch(
    `${url}/rest/v1/garage_listings?user_email=eq.${encodeURIComponent(user.email)}&order=created_at.desc`,
    { headers: h(), cache: "no-store" }
  );
  return NextResponse.json(res.ok ? await res.json() : []);
}

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = process.env.SUPABASE_URL!;
  const body = await req.json();

  if (!body.garage_car_id || !body.asking_price) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Verify car belongs to user
  const carRes = await fetch(`${url}/rest/v1/user_garage?id=eq.${body.garage_car_id}&user_email=eq.${encodeURIComponent(user.email)}&limit=1`, {
    headers: h(), cache: "no-store",
  });
  const cars = carRes.ok ? await carRes.json() : [];
  if (!cars[0]) return NextResponse.json({ error: "Car not found" }, { status: 404 });

  const listing = {
    garage_car_id: body.garage_car_id,
    user_email: user.email,
    asking_price: Number(body.asking_price),
    currency: body.currency || "EUR",
    description: body.description?.trim() || null,
    location_city: body.location_city?.trim() || null,
    location_country: body.location_country?.trim() || null,
    contact_via: body.contact_via || "platform",
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  };

  const res = await fetch(`${url}/rest/v1/garage_listings`, {
    method: "POST",
    headers: { ...h(), Prefer: "return=representation" },
    body: JSON.stringify(listing),
  });
  if (!res.ok) return NextResponse.json({ error: "Failed to create listing" }, { status: 500 });

  // Update car status to for_sale
  await fetch(`${url}/rest/v1/user_garage?id=eq.${body.garage_car_id}`, {
    method: "PATCH",
    headers: { ...h(), Prefer: "return=minimal" },
    body: JSON.stringify({ status: "for_sale", updated_at: new Date().toISOString() }),
  });

  const [created] = await res.json();
  return NextResponse.json(created, { status: 201 });
}
