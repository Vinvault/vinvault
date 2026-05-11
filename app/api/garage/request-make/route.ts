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

async function sendEmail(to: string, subject: string, html: string) {
  const key = process.env.BREVO_SMTP_KEY || process.env.SMTP_KEY;
  if (!key) return;
  await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": key, "Content-Type": "application/json" },
    body: JSON.stringify({
      sender: { name: "VinVault", email: "noreply@vinvault.net" },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  }).catch(() => {});
}

export async function POST(req: NextRequest) {
  const user = await getUser();
  const body = await req.json();

  if (!body.make_name || !body.model_name) {
    return NextResponse.json({ error: "Make and model required" }, { status: 400 });
  }

  const url = process.env.SUPABASE_URL;
  if (!url) return NextResponse.json({ error: "Server error" }, { status: 500 });

  const record = {
    user_email: user?.email || "anonymous",
    make_name: body.make_name.trim(),
    model_name: body.model_name.trim(),
    year: body.year ? Number(body.year) : null,
    reason: body.reason || null,
    production_numbers: body.production_numbers?.trim() || null,
    source_url: body.source_url?.trim() || null,
  };

  const res = await fetch(`${url}/rest/v1/garage_make_requests`, {
    method: "POST",
    headers: { ...h(), Prefer: "return=representation" },
    body: JSON.stringify(record),
  });
  if (!res.ok) return NextResponse.json({ error: "Failed to save" }, { status: 500 });

  // Send email to admin
  await sendEmail(
    "setup@vinvault.net",
    `New Make Request: ${body.make_name} ${body.model_name}`,
    `<h2>New Make Request</h2>
    <p><strong>From:</strong> ${record.user_email}</p>
    <p><strong>Make:</strong> ${body.make_name}</p>
    <p><strong>Model:</strong> ${body.model_name}</p>
    ${body.year ? `<p><strong>Year:</strong> ${body.year}</p>` : ""}
    ${body.reason ? `<p><strong>Reason:</strong> ${body.reason}</p>` : ""}
    ${body.description ? `<p><strong>Description:</strong> ${body.description}</p>` : ""}
    ${body.production_numbers ? `<p><strong>Production Numbers:</strong> ${body.production_numbers}</p>` : ""}
    ${body.source_url ? `<p><strong>Source URL:</strong> <a href="${body.source_url}">${body.source_url}</a></p>` : ""}
    <p><a href="https://www.vinvault.net/admin">Review in Admin Panel</a></p>`
  );

  return NextResponse.json({ success: true });
}
