import { NextRequest, NextResponse } from "next/server";
import { verifyCsrf } from "@/lib/csrf";

export const dynamic = "force-dynamic";

// Simple in-memory rate limiter: max 3 submissions per IP per hour
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 3600_000 });
    return true;
  }
  if (entry.count >= 3) return false;
  entry.count++;
  return true;
}

function sanitize(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, 2000).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
}

function sanitizeChassis(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 30);
}

export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  // CSRF check
  if (!verifyCsrf(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Rate limiting
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again in an hour." },
      { status: 429 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const chassis = sanitizeChassis(body.chassis_number);
  if (!chassis) {
    return NextResponse.json({ error: "Chassis number is required" }, { status: 400 });
  }

  const sanitized = {
    chassis_number: chassis,
    engine_number: sanitize(body.engine_number),
    gearbox_number: sanitize(body.gearbox_number),
    production_date: sanitize(body.production_date),
    original_market: sanitize(body.original_market),
    exterior_color: sanitize(body.exterior_color),
    interior_color: sanitize(body.interior_color),
    matching_numbers: sanitize(body.matching_numbers),
    condition_score: sanitize(body.condition_score),
    has_service_history: sanitize(body.has_service_history),
    has_books: sanitize(body.has_books),
    has_toolkit: sanitize(body.has_toolkit),
    provenance: sanitize(body.provenance),
    source: sanitize(body.source),
    submitter_email: sanitize(body.submitter_email),
    status: "pending",
    created_at: new Date().toISOString(),
  };

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/submissions`, {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(sanitized),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Supabase error:", response.status, text);
      return NextResponse.json({ error: `Database error: ${response.status}` }, { status: 500 });
    }

    // Notify admin of new submission (fire-and-forget)
    notifyAdmin(sanitized.chassis_number, sanitized.submitter_email).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Fetch error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

async function notifyAdmin(chassis: string, submitterEmail: string) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) return;
  const adminUrl = `https://www.vinvault.net/admin`;
  await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      sender: { name: "VinVault Registry", email: "registry@vinvault.net" },
      to: [{ email: "setup@vinvault.net" }],
      subject: `New submission: ${chassis} — VinVault`,
      htmlContent: `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#080F1A;font-family:Verdana,sans-serif;"><div style="max-width:600px;margin:0 auto;padding:40px 24px;"><div style="background:#0A1828;border:1px solid #1E3A5A;padding:32px;"><p style="color:#B8944A;font-size:11px;letter-spacing:3px;margin:0 0 16px;">NEW SUBMISSION</p><h1 style="color:#E2EEF7;font-size:22px;margin:0 0 12px;">Chassis ${chassis}</h1><p style="color:#8BA5B8;font-size:14px;line-height:1.6;margin:0 0 8px;">Submitted by: ${submitterEmail || "Anonymous"}</p><a href="${adminUrl}" style="display:inline-block;background:#4A90B8;color:#fff;padding:12px 24px;text-decoration:none;font-size:13px;letter-spacing:2px;margin-top:16px;">REVIEW IN ADMIN</a></div></div></body></html>`,
      textContent: `New submission for chassis ${chassis} from ${submitterEmail || "Anonymous"}.\n\nReview at: ${adminUrl}`,
    }),
  });
}
