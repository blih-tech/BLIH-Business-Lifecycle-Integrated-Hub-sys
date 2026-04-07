import { type NextRequest, NextResponse } from 'next/server';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';

/**
 * Proxies the login initiation to the NestJS API.
 *
 * The API sets transient OIDC cookies (kc_state, kc_verifier, kc_nonce, etc.)
 * and returns a 302 redirect to Keycloak. By proxying here instead of
 * redirecting the browser directly to the API, those cookies are set on the
 * FRONTEND domain (Vercel) rather than the API domain. This ensures they are
 * readable when the callback returns to this same domain.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const targetUrl = new URL(`${API_BASE_URL}/auth/login`);

  // Forward all query params: redirect, prompt, redirect_origin
  request.nextUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.set(key, value);
  });

  // Inject redirect_origin so the API knows where to send the user after login
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
  if (!location) {
    return NextResponse.redirect(new URL('/no-access', request.url));
  }

  // Relay Set-Cookie headers (kc_state, kc_verifier, kc_nonce, kc_redirect)
  // onto the FRONTEND domain so the callback route can read them.
  const nextResponse = NextResponse.redirect(location);
  for (const cookie of response.headers.getSetCookie()) {
    nextResponse.headers.append('Set-Cookie', cookie);
  }
  return nextResponse;
}
