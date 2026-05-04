import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

async function supabaseServer() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );
}

export async function GET(req: NextRequest) {
  const chassis = req.nextUrl.searchParams.get("chassis");
  if (!chassis) return NextResponse.json([], { status: 200 });

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return NextResponse.json([]);

  const res = await fetch(
    `${url}/rest/v1/chassis_comments?chassis_number=eq.${encodeURIComponent(chassis)}&order=created_at.desc&limit=100`,
    { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: "no-store" }
  );
  if (!res.ok) return NextResponse.json([]);
  return NextResponse.json(await res.json());
}

export async function POST(req: NextRequest) {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return NextResponse.json({ error: "Sign in to comment." }, { status: 401 });

  const { chassis_number, body } = await req.json();
  if (!chassis_number || !body?.trim()) return NextResponse.json({ error: "Missing fields." }, { status: 400 });
  if (body.trim().length > 2000) return NextResponse.json({ error: "Comment too long." }, { status: 400 });

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return NextResponse.json({ error: "Server error." }, { status: 500 });

  const res = await fetch(`${url}/rest/v1/chassis_comments`, {
    method: "POST",
    headers: {
      apikey: key, Authorization: `Bearer ${key}`,
      "Content-Type": "application/json", Prefer: "return=representation",
    },
    body: JSON.stringify({ chassis_number, user_email: user.email, body: body.trim() }),
  });
  if (!res.ok) return NextResponse.json({ error: "Failed to save." }, { status: 500 });
  const [comment] = await res.json();
  return NextResponse.json(comment, { status: 201 });
}
