import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hasAccessToken = request.cookies.has('kc_access');
  if (!hasAccessToken) {
    // Redirect to the frontend proxy route so OIDC state cookies are set on
    // the Vercel domain (not the API domain) and kc_access lands here too.
    const loginUrl = new URL('/api/auth/login', request.url);
    loginUrl.searchParams.set('redirect', '/dashboard');
    loginUrl.searchParams.set('redirect_origin', request.nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: '/',
};
