import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
export const dynamic = "force-dynamic";

const h = () => ({
  apikey: process.env.SUPABASE_SERVICE_KEY!,
  Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY!}`,
  "Content-Type": "application/json",
});

export async function GET(req: NextRequest) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = process.env.SUPABASE_URL;
  if (!url) return NextResponse.json([]);
  const sp = new URL(req.url).searchParams;
  const modelId = sp.get("model_id") || "";
  let query = `${url}/rest/v1/submodels?order=created_at.desc`;
  if (modelId) query += `&model_id=eq.${modelId}`;
  const res = await fetch(query, { headers: h(), cache: "no-store" });
  return NextResponse.json(res.ok ? await res.json() : []);
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = process.env.SUPABASE_URL;
  if (!url) return NextResponse.json({ error: "Config" }, { status: 500 });
  const body = await req.json();
  if (!body.name) return NextResponse.json({ error: "name required" }, { status: 400 });
  if (!body.slug && body.name) body.slug = body.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const res = await fetch(`${url}/rest/v1/submodels`, {
    method: "POST",
    headers: { ...h(), Prefer: "return=representation" },
    body: JSON.stringify(body),
  });
  return res.ok ? NextResponse.json({ ok: true, data: await res.json() }) : NextResponse.json({ error: await res.text() }, { status: 500 });
}

export async function PATCH(req: NextRequest) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = process.env.SUPABASE_URL;
  if (!url) return NextResponse.json({ error: "Config" }, { status: 500 });
  const body = await req.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const res = await fetch(`${url}/rest/v1/submodels?id=eq.${id}`, {
    method: "PATCH",
    headers: { ...h(), Prefer: "return=representation" },
    body: JSON.stringify(updates),
  });
  return res.ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: await res.text() }, { status: 500 });
}

export async function DELETE(req: NextRequest) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = process.env.SUPABASE_URL;
  if (!url) return NextResponse.json({ error: "Config" }, { status: 500 });
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const res = await fetch(`${url}/rest/v1/submodels?id=eq.${id}`, {
    method: "DELETE",
    headers: { ...h(), Prefer: "return=minimal" },
  });
  return res.ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: await res.text() }, { status: 500 });
}
