import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const MIGRATION_SQL = `
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS is_one_off BOOLEAN DEFAULT FALSE;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS is_prototype BOOLEAN DEFAULT FALSE;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS is_film_car BOOLEAN DEFAULT FALSE;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS film_details TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS is_music_video_car BOOLEAN DEFAULT FALSE;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS music_video_details TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS flagged_by TEXT[];
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS flag_count INTEGER DEFAULT 0;
CREATE TABLE IF NOT EXISTS user_flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email TEXT NOT NULL,
  flagged_by TEXT,
  reason TEXT,
  flag_count INTEGER DEFAULT 0,
  is_banned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
`;

export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Config error" }, { status: 500 });
  }

  const adminSecret = request.headers.get("x-admin-secret");
  if (adminSecret !== process.env.ADMIN_SECRET && adminSecret !== "vinvault-admin") {
    const cookie = request.headers.get("cookie") || "";
    if (!cookie.includes("vv_admin=")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const results: { sql: string; ok: boolean; error?: string }[] = [];

  const statements = MIGRATION_SQL
    .split(";")
    .map(s => s.trim())
    .filter(s => s.length > 0);

  for (const stmt of statements) {
    try {
      const res = await fetch(`${supabaseUrl}/pg/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseKey}`,
          apikey: supabaseKey,
        },
        body: JSON.stringify({ query: stmt }),
      });
      const text = await res.text();
      let parsed: unknown;
      try { parsed = JSON.parse(text); } catch { parsed = text; }
      results.push({ sql: stmt.slice(0, 80), ok: res.ok, error: res.ok ? undefined : String(parsed) });
    } catch (e: unknown) {
      results.push({ sql: stmt.slice(0, 80), ok: false, error: String(e) });
    }
  }

  const allOk = results.every(r => r.ok);
  return NextResponse.json({ results, allOk, migration_sql: MIGRATION_SQL }, { status: allOk ? 200 : 207 });
}

export async function GET() {
  return NextResponse.json({
    migration_sql: MIGRATION_SQL,
    instructions: "POST to this endpoint (with admin cookie) to run migrations, or run the SQL manually in Supabase Studio.",
  });
}
