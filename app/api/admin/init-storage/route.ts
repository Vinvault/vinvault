import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST() {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_token")?.value !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return NextResponse.json({ error: "Server error." }, { status: 500 });

  const results: Record<string, string> = {};

  // Create chassis-photos bucket (public)
  const bucketRes = await fetch(`${url}/storage/v1/bucket`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: "chassis-photos", name: "chassis-photos", public: true }),
  });
  results["chassis-photos"] = bucketRes.ok ? "created" : `${bucketRes.status}: ${await bucketRes.text()}`;

  return NextResponse.json(results);
}
