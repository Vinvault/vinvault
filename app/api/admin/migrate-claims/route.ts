import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// One-time migration token — deleted after use
const MIGRATION_TOKEN = "vv-migrate-2026-a7f3b9e1";

export async function POST(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (token !== MIGRATION_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return NextResponse.json({ error: "Missing env vars" }, { status: 500 });

  const results: Record<string, unknown> = {};

  // Run ALTER TABLE via pg-meta
  const sql = `ALTER TABLE car_claims ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;`;

  const pgMetaRes = await fetch(`${url}/pg/query`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: sql }),
  });

  results["pg_meta_status"] = pgMetaRes.status;
  results["pg_meta_body"] = await pgMetaRes.text();

  // Verify via OpenAPI schema
  const schemaRes = await fetch(`${url}/rest/v1/`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (schemaRes.ok) {
    const schema = await schemaRes.json();
    const cols = Object.keys(schema?.definitions?.car_claims?.properties ?? {});
    results["car_claims_columns"] = cols;
    results["has_user_id"] = cols.includes("user_id");
  }

  return NextResponse.json(results);
}
