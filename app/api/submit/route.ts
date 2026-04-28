import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  if (!body.chassis_number) {
    return NextResponse.json({ error: 'Chassis number is required' }, { status: 400 });
  }

  const { error } = await supabase.from('submissions').insert([body]);
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
