import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";

const supaHeaders = () => ({
  apikey: process.env.SUPABASE_SERVICE_KEY!,
  Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY!}`,
  "Content-Type": "application/json",
});

export async function GET() {
  const url = process.env.SUPABASE_URL;
  if (!url) return NextResponse.json([]);
  const res = await fetch(`${url}/rest/v1/models?order=make.asc,model.asc&limit=200`, { headers: supaHeaders() });
  return NextResponse.json(res.ok ? await res.json() : []);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const url = process.env.SUPABASE_URL;
  if (!url) return NextResponse.json({ error: "No config" }, { status: 500 });
  const res = await fetch(`${url}/rest/v1/models`, {
    method: "POST",
    headers: { ...supaHeaders(), Prefer: "return=representation" },
    body: JSON.stringify(body),
  });
  return res.ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: await res.text() }, { status: 500 });
}
