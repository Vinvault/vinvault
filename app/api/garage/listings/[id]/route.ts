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

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUser();
  if (!user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = process.env.SUPABASE_URL!;
  const body = await req.json();
  const updates: Record<string, unknown> = {};
  if (body.asking_price !== undefined) updates.asking_price = Number(body.asking_price);
  if (body.currency) updates.currency = body.currency;
  if (body.description !== undefined) updates.description = body.description;
  if (body.location_city !== undefined) updates.location_city = body.location_city;
  if (body.location_country !== undefined) updates.location_country = body.location_country;
  if (body.contact_via) updates.contact_via = body.contact_via;
  if (body.is_active !== undefined) updates.is_active = body.is_active;

  const res = await fetch(`${url}/rest/v1/garage_listings?id=eq.${id}&user_email=eq.${encodeURIComponent(user.email)}`, {
    method: "PATCH",
    headers: { ...h(), Prefer: "return=representation" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  const data = await res.json();
  return NextResponse.json(data[0] ?? {});
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUser();
  if (!user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = process.env.SUPABASE_URL!;

  // Get the listing to find the car
  const listRes = await fetch(`${url}/rest/v1/garage_listings?id=eq.${id}&user_email=eq.${encodeURIComponent(user.email)}&limit=1`, {
    headers: h(), cache: "no-store",
  });
  const listings = listRes.ok ? await listRes.json() : [];
  const listing = listings[0];

  await fetch(`${url}/rest/v1/garage_listings?id=eq.${id}&user_email=eq.${encodeURIComponent(user.email)}`, {
    method: "DELETE",
    headers: h(),
  });

  if (listing?.garage_car_id) {
    await fetch(`${url}/rest/v1/user_garage?id=eq.${listing.garage_car_id}`, {
      method: "PATCH",
      headers: { ...h(), Prefer: "return=minimal" },
      body: JSON.stringify({ status: "current", updated_at: new Date().toISOString() }),
    });
  }

  return NextResponse.json({ success: true });
}
