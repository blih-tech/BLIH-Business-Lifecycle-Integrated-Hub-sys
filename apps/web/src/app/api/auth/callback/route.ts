import { type NextRequest, NextResponse } from 'next/server';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';

/**
 * Proxies the OIDC authorization code callback to the NestJS API.
 *
 * The API validates state/nonce, exchanges the code for tokens, and responds
 * with Set-Cookie headers (kc_access, kc_refresh, kc_id, kc_csrf) plus a 302
 * redirect. By intercepting here, we relay those cookies onto the FRONTEND
 * domain instead of the API domain, so getSession() can read kc_access from
 * the browser's cookie jar during server-side rendering on Vercel.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const targetUrl = new URL(`${API_BASE_URL}/auth/callback`);

  // Forward code + state (and any other params Keycloak may add)
  request.nextUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.set(key, value);
  });

  const response = await fetch(targetUrl.toString(), {
    method: 'GET',
    headers: {
      // Forward browser cookies so the API can validate kc_state / kc_verifier
      cookie: request.headers.get('cookie') ?? '',
    },
    redirect: 'manual',
  });

  const location = response.headers.get('location');

  // Resolve redirect target: the API typically returns an absolute frontend URL
  // (AUTH_FRONTEND_BASE_URL + /dashboard) but fall back to /dashboard locally.
  const redirectTo = location
    ? location.startsWith('http')
      ? location
      : new URL(location, request.nextUrl.origin).toString()
    : new URL('/dashboard', request.nextUrl.origin).toString();

  const nextResponse = NextResponse.redirect(redirectTo);

  // Relay Set-Cookie headers (kc_access, kc_refresh, kc_id, kc_csrf) onto the
  // frontend domain so subsequent server-side fetches include the auth token.
  for (const cookie of response.headers.getSetCookie()) {
    nextResponse.headers.append('Set-Cookie', cookie);
  }

  return nextResponse;
}
