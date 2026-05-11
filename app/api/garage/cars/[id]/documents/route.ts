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
  const carRes = await fetch(`${url}/rest/v1/user_garage?id=eq.${id}&user_email=eq.${encodeURIComponent(user.email)}&limit=1`, {
    headers: h(), cache: "no-store",
  });
  const cars = carRes.ok ? await carRes.json() : [];
  if (!cars[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const docType = (formData.get("document_type") as string) || "other";
  const isPublic = formData.get("is_public") === "true";

  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const ext = file.name.split(".").pop() ?? "pdf";
  const fileName = `${user.email}/${id}/${Date.now()}_${file.name}`;
  const bytes = await file.arrayBuffer();

  const uploadRes = await fetch(`${url}/storage/v1/object/garage-documents/${fileName}`, {
    method: "POST",
    headers: {
      apikey: SVC_KEY(),
      Authorization: `Bearer ${SVC_KEY()}`,
      "Content-Type": file.type || "application/pdf",
    },
    body: bytes,
  });
  if (!uploadRes.ok) return NextResponse.json({ error: "Upload failed" }, { status: 500 });

  const fileUrl = `${url}/storage/v1/object/garage-documents/${fileName}`;

  const saveRes = await fetch(`${url}/rest/v1/garage_documents`, {
    method: "POST",
    headers: { ...h(), Prefer: "return=representation" },
    body: JSON.stringify({ garage_car_id: id, user_email: user.email, file_url: fileUrl, file_name: file.name, document_type: docType, is_public: isPublic }),
  });
  if (!saveRes.ok) return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  const [doc] = await saveRes.json();
  return NextResponse.json(doc, { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUser();
  if (!user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = process.env.SUPABASE_URL!;
  const { doc_id } = await req.json();
  if (!doc_id) return NextResponse.json({ error: "Missing doc_id" }, { status: 400 });

  await fetch(`${url}/rest/v1/garage_documents?id=eq.${doc_id}&garage_car_id=eq.${id}&user_email=eq.${encodeURIComponent(user.email)}`, {
    method: "DELETE",
    headers: h(),
  });
  return NextResponse.json({ success: true });
}
