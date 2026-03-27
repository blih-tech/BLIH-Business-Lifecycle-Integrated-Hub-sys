import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://blihapi.blihmarketing.com/api/v1';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const DEMO_MODE = process.env.DEMO_MODE === 'true';

export function middleware(request: NextRequest) {
  // Allow auth endpoints (login, logout, callback) to pass through without auth check
  if (request.nextUrl.pathname.startsWith('/auth/')) {
    try {
      const targetUrl = new URL(
        `${API_BASE_URL}${request.nextUrl.pathname}${request.nextUrl.search}`,
      );
      return NextResponse.redirect(targetUrl);
    } catch (e) {
      console.error('[Middleware] Invalid URL construction:', e);
      return NextResponse.next();
    }
  }

  const hasAccessToken = request.cookies.has('kc_access');
  if (!hasAccessToken) {
    try {
      const loginUrl = new URL(`${API_BASE_URL}/auth/login`, request.url);
      loginUrl.searchParams.set('redirect', '/dashboard');
      loginUrl.searchParams.set('redirect_origin', request.nextUrl.origin);
      return NextResponse.redirect(loginUrl);
    } catch (e) {
      console.error('[Middleware] Invalid login URL construction:', e);
      return NextResponse.next();
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: '/',
};
