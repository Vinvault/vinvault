import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vinvault.net';

export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !supabaseKey) return NextResponse.json({ error: 'Config error' }, { status: 500 });
  const formData = await request.formData();
  const id = formData.get('id');

  const res = await fetch(`${supabaseUrl}/rest/v1/submissions?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify({ status: 'rejected' }),
  });

  if (res.ok) {
    const rows = await res.json();
    const sub = rows?.[0];
    if (sub?.submitter_email) {
      notifySubmitter(sub.submitter_email, sub.chassis_number).catch(() => {});
    }
  }

  return NextResponse.redirect(new URL('/admin', SITE_URL), { status: 303 });
}

async function notifySubmitter(email: string, chassis: string) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) return;

  await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sender: { name: 'VinVault Registry', email: 'registry@vinvault.net' },
      to: [{ email }],
      subject: `Update on your submission for ${chassis} — VinVault`,
      htmlContent: `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#080F1A;font-family:Georgia,serif;">
        <div style="max-width:600px;margin:0 auto;padding:40px 24px;">
          <div style="background:#0A1828;border:1px solid #1E3A5A;padding:32px;">
            <p style="color:#4A90B8;font-size:10px;letter-spacing:3px;margin:0 0 8px;">VINVAULT REGISTRY</p>
            <h1 style="color:#E2EEF7;font-size:22px;margin:0 0 24px;">Submission Update</h1>
            <p style="color:#8BA5B8;font-size:14px;line-height:1.6;margin:0 0 16px;">
              Thank you for submitting chassis
              <strong style="color:#E2EEF7;font-family:monospace;">${chassis}</strong>
              to VinVault. After review, we were unable to approve this submission.
              This may be due to insufficient documentation or a duplicate entry.
            </p>
            <p style="color:#8BA5B8;font-size:14px;line-height:1.6;">
              If you have additional information or believe this is an error, please
              <a href="mailto:contact@vinvault.net" style="color:#4A90B8;">contact us</a>.
            </p>
          </div>
        </div>
      </body></html>`,
      textContent: `Your submission for ${chassis} could not be approved. Contact contact@vinvault.net for details.`,
    }),
  });
}
