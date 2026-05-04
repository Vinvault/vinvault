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
  const userParam = req.nextUrl.searchParams.get("user");
  if (!userParam) return NextResponse.json([]);

  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return NextResponse.json([], { status: 401 });

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return NextResponse.json([]);

  const res = await fetch(
    `${url}/rest/v1/car_claims?user_email=eq.${encodeURIComponent(user.email)}&order=created_at.desc`,
    { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: "no-store" }
  );
  if (!res.ok) return NextResponse.json([]);
  return NextResponse.json(await res.json());
}

export async function POST(req: NextRequest) {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return NextResponse.json({ error: "Sign in to claim." }, { status: 401 });

  const { chassis_number, message } = await req.json();
  if (!chassis_number) return NextResponse.json({ error: "Missing chassis." }, { status: 400 });

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return NextResponse.json({ error: "Server error." }, { status: 500 });

  // Check for existing pending claim
  const existing = await fetch(
    `${url}/rest/v1/car_claims?chassis_number=eq.${encodeURIComponent(chassis_number)}&user_email=eq.${encodeURIComponent(user.email)}&status=eq.pending`,
    { headers: { apikey: key, Authorization: `Bearer ${key}` } }
  );
  const existingData = await existing.json();
  if (existingData?.length > 0) return NextResponse.json({ error: "Claim already pending." }, { status: 409 });

  const res = await fetch(`${url}/rest/v1/car_claims`, {
    method: "POST",
    headers: {
      apikey: key, Authorization: `Bearer ${key}`,
      "Content-Type": "application/json", Prefer: "return=representation",
    },
    body: JSON.stringify({ chassis_number, user_id: user.id, user_email: user.email, message: message?.trim() || null }),
  });
  if (!res.ok) return NextResponse.json({ error: "Failed to save." }, { status: 500 });
  const [claim] = await res.json();
  return NextResponse.json(claim, { status: 201 });
}
