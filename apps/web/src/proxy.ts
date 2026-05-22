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

  // Auth gating cannot happen here. The API issues HttpOnly cookies scoped
  // to its own host (blihapi.blihmarketing.com); they are never visible to
  // this Vercel-hosted middleware. Gating runs client-side in <AuthGate />.
  if (isDashboardRoute(pathname)) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-pathname', pathname);
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
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
