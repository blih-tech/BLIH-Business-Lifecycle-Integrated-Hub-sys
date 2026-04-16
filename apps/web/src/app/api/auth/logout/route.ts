import { LOCAL_SESSION_COOKIE } from '@/lib/auth-constants';
import { getApiBaseUrl } from '@/lib/api-base';
import { type NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = getApiBaseUrl();

/**
 * Proxies the logout request to the NestJS API.
 *
 * The API revokes the refresh token, clears auth cookies, and redirects
 * through Keycloak end-session. By proxying here, the cookie-clearing
 * Set-Cookie headers are applied to the FRONTEND domain, which ensures
 * kc_access (stored on the Vercel domain) is actually removed.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const targetUrl = new URL(`${API_BASE_URL}/auth/logout`);

  request.nextUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.set(key, value);
  });

  // Tell the API which origin to redirect to after Keycloak end-session
  if (!targetUrl.searchParams.has('redirect_origin')) {
    targetUrl.searchParams.set('redirect_origin', request.nextUrl.origin);
  }

  const response = await fetch(targetUrl.toString(), {
    method: 'GET',
    headers: {
      cookie: request.headers.get('cookie') ?? '',
    },
    redirect: 'manual',
  });

  const location = response.headers.get('location');

  const redirectTo = location
    ? location.startsWith('http')
      ? location
      : new URL(location, request.nextUrl.origin).toString()
    : new URL('/', request.nextUrl.origin).toString();

  const nextResponse = NextResponse.redirect(redirectTo);

  // Relay Set-Cookie headers that clear kc_access, kc_refresh, etc.
  // on the frontend domain.
  for (const cookie of response.headers.getSetCookie()) {
    nextResponse.headers.append('Set-Cookie', cookie);
  }

  nextResponse.cookies.set(LOCAL_SESSION_COOKIE, '', {
    path: '/',
    maxAge: 0,
  });

  return nextResponse;
}
