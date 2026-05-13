import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const DASHBOARD_PREFIXES = [
  '/hr',
  '/finance',
  '/crm',
  '/brain',
  '/pm',
  '/superadmin',
] as const;

function isDashboardRoute(pathname: string): boolean {
  return DASHBOARD_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isDashboardRoute(pathname)) {
    const hasAccessToken = request.cookies.has('kc_access');
    if (!hasAccessToken) {
      const loginUrl = new URL('/api/auth/login', request.url);
      loginUrl.searchParams.set(
        'redirect',
        `${pathname}${request.nextUrl.search}`,
      );
      loginUrl.searchParams.set('redirect_origin', request.nextUrl.origin);
      return NextResponse.redirect(loginUrl);
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-pathname', pathname);
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  if (pathname === '/') {
    const hasAccessToken = request.cookies.has('kc_access');
    if (!hasAccessToken) {
      const loginUrl = new URL('/api/auth/login', request.url);
      loginUrl.searchParams.set('redirect', '/');
      loginUrl.searchParams.set('redirect_origin', request.nextUrl.origin);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/hr',
    '/hr/:path*',
    '/finance',
    '/finance/:path*',
    '/crm',
    '/crm/:path*',
    '/brain',
    '/brain/:path*',
    '/pm',
    '/pm/:path*',
    '/superadmin',
    '/superadmin/:path*',
  ],
};
