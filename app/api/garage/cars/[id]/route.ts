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

async function fetchCar(id: string, email: string) {
  const url = process.env.SUPABASE_URL!;
  const res = await fetch(
    `${url}/rest/v1/user_garage?id=eq.${encodeURIComponent(id)}&user_email=eq.${encodeURIComponent(email)}&limit=1`,
    { headers: h(), cache: "no-store" }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data[0] ?? null;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUser();
  if (!user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const car = await fetchCar(id, user.email);
  if (!car) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const url = process.env.SUPABASE_URL!;
  const [photosRes, docsRes] = await Promise.all([
    fetch(`${url}/rest/v1/garage_photos?garage_car_id=eq.${id}&order=is_cover.desc,uploaded_at.asc`, { headers: h(), cache: "no-store" }),
    fetch(`${url}/rest/v1/garage_documents?garage_car_id=eq.${id}&order=uploaded_at.desc`, { headers: h(), cache: "no-store" }),
  ]);

  return NextResponse.json({
    ...car,
    photos: photosRes.ok ? await photosRes.json() : [],
    documents: docsRes.ok ? await docsRes.json() : [],
  });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUser();
  if (!user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await fetchCar(id, user.email);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const url = process.env.SUPABASE_URL!;
  const body = await req.json();
  const updates = {
    make_name: body.make_name?.trim() ?? existing.make_name,
    model: body.model?.trim() ?? existing.model,
    submodel: body.submodel?.trim() ?? null,
    year: body.year ? Number(body.year) : null,
    color: body.color?.trim() ?? null,
    vin: body.vin?.trim() ?? null,
    mileage: body.mileage ? Number(body.mileage) : null,
    mileage_unit: body.mileage_unit ?? "km",
    purchase_date: body.purchase_date ?? null,
    purchase_price: body.purchase_price ? Number(body.purchase_price) : null,
    numberplate: body.numberplate?.trim() ?? null,
    notes: body.notes?.trim() ?? null,
    status: body.status ?? existing.status,
    date_sold: body.date_sold ?? null,
    updated_at: new Date().toISOString(),
  };

  const res = await fetch(`${url}/rest/v1/user_garage?id=eq.${id}`, {
    method: "PATCH",
    headers: { ...h(), Prefer: "return=representation" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  const [updated] = await res.json();
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUser();
  if (!user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await fetchCar(id, user.email);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const url = process.env.SUPABASE_URL!;
  await fetch(`${url}/rest/v1/user_garage?id=eq.${id}`, {
    method: "DELETE",
    headers: h(),
  });
  return NextResponse.json({ success: true });
}
