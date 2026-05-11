import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
export const dynamic = "force-dynamic";

const h = () => ({
  apikey: process.env.SUPABASE_SERVICE_KEY!,
  Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY!}`,
  "Content-Type": "application/json",
});

export async function GET() {
  const url = process.env.SUPABASE_URL;
  if (!url) return NextResponse.json([]);
  const res = await fetch(`${url}/rest/v1/makes?order=name.asc`, { headers: h(), cache: "no-store" });
  return NextResponse.json(res.ok ? await res.json() : []);
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const url = process.env.SUPABASE_URL;
  if (!url) return NextResponse.json({ error: "No config" }, { status: 500 });
  const res = await fetch(`${url}/rest/v1/makes`, {
    method: "POST",
    headers: { ...h(), Prefer: "return=representation" },
    body: JSON.stringify(body),
  });
  if (!res.ok) return NextResponse.json({ error: await res.text() }, { status: 500 });
  const [created] = await res.json();
  return NextResponse.json(created, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, ...updates } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const url = process.env.SUPABASE_URL;
  if (!url) return NextResponse.json({ error: "No config" }, { status: 500 });
  const res = await fetch(`${url}/rest/v1/makes?id=eq.${id}`, {
    method: "PATCH",
    headers: { ...h(), Prefer: "return=representation" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) return NextResponse.json({ error: await res.text() }, { status: 500 });
  const data = await res.json();
  return NextResponse.json(data[0] ?? {});
}

export async function DELETE(req: NextRequest) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const url = process.env.SUPABASE_URL;
  if (!url) return NextResponse.json({ error: "No config" }, { status: 500 });
  await fetch(`${url}/rest/v1/makes?id=eq.${id}`, { method: "DELETE", headers: h() });
  return NextResponse.json({ ok: true });
}
