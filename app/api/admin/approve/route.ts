import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !supabaseKey) return NextResponse.json({ error: 'Config error' }, { status: 500 });
  const formData = await request.formData();
  const id = formData.get('id');
  await fetch(`${supabaseUrl}/rest/v1/submissions?id=eq.${id}`, {
    method: 'PATCH',
    headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'approved' })
  });
  return NextResponse.redirect(new URL('/admin', request.url));
}
