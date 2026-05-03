import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return NextResponse.json({ error: 'Auth not configured' }, { status: 500 });
  }

  const formData = await request.formData();
  const password = formData.get('password') as string;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `https://${request.headers.get('host')}`;

  if (!password || password !== adminPassword) {
    const login = new URL('/admin/login', siteUrl);
    login.searchParams.set('error', '1');
    const next = formData.get('next') as string;
    if (next) login.searchParams.set('next', next);
    return NextResponse.redirect(login, { status: 303 });
  }

  const token = createHash('sha256').update(adminPassword).digest('hex');
  const next = (formData.get('next') as string) || '/admin';
  const response = NextResponse.redirect(new URL(next, siteUrl), { status: 303 });
  response.cookies.set('admin_auth', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return response;
}
