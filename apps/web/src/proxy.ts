import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const DEMO_MODE = process.env.DEMO_MODE === 'true';

export function proxy(request: NextRequest) {
  // if (DEMO_MODE) {
  //   return NextResponse.next();
  // }

  // Allow auth endpoints (login, logout, callback) to pass through without auth check
  if (request.nextUrl.pathname.startsWith('/auth/')) {
    const targetUrl = `${API_BASE_URL}${request.nextUrl.pathname}${request.nextUrl.search}`;
    return NextResponse.rewrite(targetUrl);
  }

  const hasAccessToken = request.cookies.has('kc_access');
  if (!hasAccessToken) {
    const loginUrl = new URL(`${API_BASE_URL}/auth/login`, request.url);
    loginUrl.searchParams.set('redirect', '/dashboard');
    loginUrl.searchParams.set('redirect_origin', request.nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: '/',
};
