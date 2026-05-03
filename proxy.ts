import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createHash } from 'crypto';

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};

function expectedToken(): string | null {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return null;
  return createHash('sha256').update(pw).digest('hex');
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Login routes are always public
  if (pathname === '/admin/login' || pathname === '/api/admin/login') {
    return NextResponse.next();
  }

  const token = expectedToken();
  const cookie = request.cookies.get('admin_auth')?.value;

  if (!token || cookie !== token) {
    // API routes get 401; pages get redirected to login
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `https://${request.headers.get('host')}`;
    const login = new URL('/admin/login', siteUrl);
    login.searchParams.set('next', pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}
