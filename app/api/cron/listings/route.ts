import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const h = () => ({
  apikey: process.env.SUPABASE_SERVICE_KEY!,
  Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY!}`,
  "Content-Type": "application/json",
});

async function sendEmail(to: string, subject: string, html: string) {
  const smtp = process.env.BREVO_SMTP_KEY || process.env.SMTP_KEY;
  if (!smtp) return;
  await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": smtp, "Content-Type": "application/json" },
    body: JSON.stringify({
      sender: { name: "VinVault", email: "noreply@vinvault.net" },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  }).catch(() => {});
}

export async function GET() {
  const url = process.env.SUPABASE_URL;
  if (!url) return NextResponse.json({ error: "No DB" }, { status: 500 });

  const now = new Date();
  const in7days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

  // Listings expiring in 7 days
  const warnRes = await fetch(
    `${url}/rest/v1/garage_listings?is_active=eq.true&expires_at=lt.${in7days}&expires_at=gt.${now.toISOString()}`,
    { headers: h(), cache: "no-store" }
  );
  const expiring = warnRes.ok ? await warnRes.json() : [];
  for (const l of expiring) {
    await sendEmail(l.user_email, "Your VinVault listing expires in 7 days",
      `<p>Your listing expires in 7 days. <a href="https://www.vinvault.net/for-sale/${l.id}">Renew it here</a>.</p>`
    );
  }

  // Expired listings
  const expiredRes = await fetch(
    `${url}/rest/v1/garage_listings?is_active=eq.true&expires_at=lt.${now.toISOString()}`,
    { headers: h(), cache: "no-store" }
  );
  const expired = expiredRes.ok ? await expiredRes.json() : [];
  for (const l of expired) {
    await fetch(`${url}/rest/v1/garage_listings?id=eq.${l.id}`, {
      method: "PATCH",
      headers: { ...h(), Prefer: "return=minimal" },
      body: JSON.stringify({ is_active: false }),
    });
    await sendEmail(l.user_email, "Your VinVault listing has expired",
      `<p>Your listing has expired. <a href="https://www.vinvault.net/for-sale/${l.id}">Renew to keep it active</a>.</p>`
    );
  }

  return NextResponse.json({ warned: expiring.length, deactivated: expired.length });
}
