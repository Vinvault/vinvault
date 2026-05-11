import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

const SVC_KEY = () => process.env.SUPABASE_SERVICE_KEY!;
const h = () => ({
  apikey: SVC_KEY(),
  Authorization: `Bearer ${SVC_KEY()}`,
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

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUser();
  if (!user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = process.env.SUPABASE_URL!;

  // Verify car belongs to user
  const carRes = await fetch(`${url}/rest/v1/user_garage?id=eq.${id}&user_email=eq.${encodeURIComponent(user.email)}&limit=1`, {
    headers: h(), cache: "no-store",
  });
  const cars = carRes.ok ? await carRes.json() : [];
  if (!cars[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const isCover = formData.get("is_cover") === "true";
  const caption = (formData.get("caption") as string) || null;

  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const ext = file.name.split(".").pop() ?? "jpg";
  const fileName = `${user.email}/${id}/${Date.now()}.${ext}`;
  const bytes = await file.arrayBuffer();

  const uploadRes = await fetch(`${url}/storage/v1/object/garage-photos/${fileName}`, {
    method: "POST",
    headers: {
      apikey: SVC_KEY(),
      Authorization: `Bearer ${SVC_KEY()}`,
      "Content-Type": file.type || "image/jpeg",
    },
    body: bytes,
  });
  if (!uploadRes.ok) return NextResponse.json({ error: "Upload failed" }, { status: 500 });

  const photoUrl = `${url}/storage/v1/object/public/garage-photos/${fileName}`;

  // If setting as cover, unset existing covers
  if (isCover) {
    await fetch(`${url}/rest/v1/garage_photos?garage_car_id=eq.${id}`, {
      method: "PATCH",
      headers: { ...h(), Prefer: "return=minimal" },
      body: JSON.stringify({ is_cover: false }),
    });
  }

  const saveRes = await fetch(`${url}/rest/v1/garage_photos`, {
    method: "POST",
    headers: { ...h(), Prefer: "return=representation" },
    body: JSON.stringify({ garage_car_id: id, user_email: user.email, photo_url: photoUrl, is_cover: isCover, caption }),
  });
  if (!saveRes.ok) return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  const [photo] = await saveRes.json();
  return NextResponse.json(photo, { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUser();
  if (!user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = process.env.SUPABASE_URL!;
  const { photo_id } = await req.json();
  if (!photo_id) return NextResponse.json({ error: "Missing photo_id" }, { status: 400 });

  await fetch(`${url}/rest/v1/garage_photos?id=eq.${photo_id}&garage_car_id=eq.${id}&user_email=eq.${encodeURIComponent(user.email)}`, {
    method: "DELETE",
    headers: h(),
  });
  return NextResponse.json({ success: true });
}
