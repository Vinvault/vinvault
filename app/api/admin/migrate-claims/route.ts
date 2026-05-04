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
  if (!url || !key) return NextResponse.json({ error: "Missing env vars" }, { status: 500 });

  const results: Record<string, unknown> = {};

  // Use pg-meta to run raw SQL
  const sql = `
    ALTER TABLE car_claims
    ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  `;

  const pgMetaRes = await fetch(`${url}/pg/query`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: sql }),
  });

  results["pg-meta"] = {
    status: pgMetaRes.status,
    body: await pgMetaRes.text(),
  };

  // Verify the column now exists via OpenAPI schema
  const schemaRes = await fetch(`${url}/rest/v1/`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (schemaRes.ok) {
    const schema = await schemaRes.json();
    const cols = Object.keys(
      schema?.definitions?.car_claims?.properties ?? {}
    );
    results["car_claims_columns"] = cols;
    results["has_user_id"] = cols.includes("user_id");
  }

  return NextResponse.json(results);
}
