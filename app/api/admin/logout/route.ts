import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `https://${request.headers.get('host')}`;
  const response = NextResponse.redirect(new URL('/admin/login', siteUrl), { status: 303 });
  response.cookies.set('admin_auth', '', { maxAge: 0, path: '/' });
  return response;
}
