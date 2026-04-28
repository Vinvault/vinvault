import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync, appendFileSync, existsSync } from 'fs';
import { join } from 'path';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.chassis_number) {
    return NextResponse.json({ error: 'Chassis number is required' }, { status: 400 });
  }

  const submission = {
    ...body,
    id: Date.now(),
    submitted_at: new Date().toISOString(),
    status: 'pending'
  };

  try {
    const filePath = '/tmp/submissions.json';
    let submissions = [];
    if (existsSync(filePath)) {
      const content = require('fs').readFileSync(filePath, 'utf8');
      submissions = JSON.parse(content);
    }
    submissions.push(submission);
    writeFileSync(filePath, JSON.stringify(submissions, null, 2));
  } catch (err) {
    console.error('File write error:', err);
  }

  // Send email via Brevo
  try {
    await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY || '',
      },
      body: JSON.stringify({
        sender: { email: 'noreply@vinvault.net', name: 'VinVault Registry' },
        to: [{ email: 'setup@vinvault.net' }],
        subject: `New Submission: Ferrari 288 GTO - ${body.chassis_number}`,
        textContent: JSON.stringify(submission, null, 2),
      }),
    });
  } catch (err) {
    console.error('Email error:', err);
  }

  return NextResponse.json({ success: true });
}
