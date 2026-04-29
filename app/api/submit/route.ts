import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Server configuration error - missing env vars' }, { status: 500 });
  }

  const body = await request.json();

  if (!body.chassis_number) {
    return NextResponse.json({ error: 'Chassis number is required' }, { status: 400 });
  }

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/submissions`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        ...body,
        status: 'pending',
        created_at: new Date().toISOString()
      })
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Supabase error:', response.status, text);
      return NextResponse.json({ error: `Database error: ${response.status} ${text}` }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error('Fetch error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
