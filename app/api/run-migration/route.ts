import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const TOKEN = "vv-migrate-2026-a7f3b9e1";

export async function GET() {
  return NextResponse.json({ version: "v1", ready: true });
}

export async function POST(req: NextRequest) {
  if (req.nextUrl.searchParams.get("token") !== TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return NextResponse.json({ error: "Missing env vars" }, { status: 500 });

  const sql = `ALTER TABLE car_claims ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;`;

  const pgRes = await fetch(`${url}/pg/query`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: sql }),
  });

  const pgBody = await pgRes.text();

  // Verify via OpenAPI schema
  const schemaRes = await fetch(`${url}/rest/v1/`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  let cols: string[] = [];
  if (schemaRes.ok) {
    const schema = await schemaRes.json();
    cols = Object.keys(schema?.definitions?.car_claims?.properties ?? {});
  }

  return NextResponse.json({
    pg_status: pgRes.status,
    pg_body: pgBody,
    car_claims_columns: cols,
    has_user_id: cols.includes("user_id"),
  });
}
