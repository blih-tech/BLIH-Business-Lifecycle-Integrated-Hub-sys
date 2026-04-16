import { getApiBaseUrl, isLocalhostApiUrl } from '@/lib/api-base';
import { LOCAL_SESSION_COOKIE } from '@/lib/auth-constants';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const API_BASE_URL = getApiBaseUrl();

function apiLooksLocalForMiddleware(): boolean {
  const onVercel =
    process.env.VERCEL === '1' || process.env.NEXT_PUBLIC_BLIH_VERCEL === '1';
  if (onVercel) {
    return false;
  }
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!raw) {
    return true;
  }
  return isLocalhostApiUrl(raw.replace(/\/+$/, ''));
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const DEMO_MODE = process.env.DEMO_MODE === 'true';

const skipKcCookieCheck =
  process.env.NEXT_PUBLIC_AUTH_SKIP_MIDDLEWARE_KC_CHECK === 'true' ||
  apiLooksLocalForMiddleware();

export function middleware(request: NextRequest) {
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

  const hasApiCookie = request.cookies.has('kc_access');
  const hasLocalDevSession = request.cookies.has(LOCAL_SESSION_COOKIE);

  if (!skipKcCookieCheck && !hasApiCookie && !hasLocalDevSession) {
    try {
      const loginUrl = new URL('/api/auth/login', request.url);
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
