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

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUser();
  if (!user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = process.env.SUPABASE_URL!;
  const listRes = await fetch(`${url}/rest/v1/garage_listings?id=eq.${id}&user_email=eq.${encodeURIComponent(user.email)}&limit=1`, {
    headers: h(), cache: "no-store",
  });
  const listings = listRes.ok ? await listRes.json() : [];
  if (!listings[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const newExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const res = await fetch(`${url}/rest/v1/garage_listings?id=eq.${id}`, {
    method: "PATCH",
    headers: { ...h(), Prefer: "return=representation" },
    body: JSON.stringify({ expires_at: newExpiry, is_active: true, renewed_count: (listings[0].renewed_count || 0) + 1 }),
  });
  const data = await res.json();
  return NextResponse.json(data[0] ?? {});
}
