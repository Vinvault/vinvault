import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

async function getUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );
  return supabase.auth.getUser();
}

export async function GET(req: NextRequest) {
  const chassis = req.nextUrl.searchParams.get("chassis");
  if (!chassis) return NextResponse.json({ watching: false });
  const { data: { user } } = await getUser();
  if (!user?.email) return NextResponse.json({ watching: false });

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return NextResponse.json({ watching: false });

  const res = await fetch(
    `${url}/rest/v1/car_watches?chassis_number=eq.${encodeURIComponent(chassis)}&user_email=eq.${encodeURIComponent(user.email)}`,
    { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: "no-store" }
  );
  const data = await res.json();
  return NextResponse.json({ watching: Array.isArray(data) && data.length > 0 });
}

export async function POST(req: NextRequest) {
  const { data: { user } } = await getUser();
  if (!user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { chassis_number } = await req.json();
  if (!chassis_number) return NextResponse.json({ error: "Missing chassis." }, { status: 400 });

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return NextResponse.json({ error: "Server error." }, { status: 500 });

  await fetch(`${url}/rest/v1/car_watches`, {
    method: "POST",
    headers: {
      apikey: key, Authorization: `Bearer ${key}`,
      "Content-Type": "application/json", Prefer: "resolution=ignore-duplicates",
    },
    body: JSON.stringify({ chassis_number, user_email: user.email }),
  });
  return NextResponse.json({ watching: true });
}

export async function DELETE(req: NextRequest) {
  const { data: { user } } = await getUser();
  if (!user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { chassis_number } = await req.json();
  if (!chassis_number) return NextResponse.json({ error: "Missing chassis." }, { status: 400 });

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return NextResponse.json({ error: "Server error." }, { status: 500 });

  await fetch(
    `${url}/rest/v1/car_watches?chassis_number=eq.${encodeURIComponent(chassis_number)}&user_email=eq.${encodeURIComponent(user.email)}`,
    { method: "DELETE", headers: { apikey: key, Authorization: `Bearer ${key}` } }
  );
  return NextResponse.json({ watching: false });
}
