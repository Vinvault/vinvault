import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";

const headers = () => ({
  apikey: process.env.SUPABASE_SERVICE_KEY!,
  Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY!}`,
  "Content-Type": "application/json",
});

export async function GET() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return NextResponse.json([], { status: 200 });
  const res = await fetch(`${url}/rest/v1/spotter_events?is_approved=eq.false&order=created_at.desc`, { headers: headers() });
  const data = res.ok ? await res.json() : [];
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const { id, is_approved } = await req.json();
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return NextResponse.json({ error: "No config" }, { status: 500 });
  const res = await fetch(`${url}/rest/v1/spotter_events?id=eq.${id}`, {
    method: "PATCH",
    headers: { ...headers(), Prefer: "return=minimal" },
    body: JSON.stringify({ is_approved }),
  });
  return res.ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Failed" }, { status: 500 });
}
