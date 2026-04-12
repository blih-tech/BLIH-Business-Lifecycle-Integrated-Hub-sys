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

  const requestHeaders: Record<string, string> = {
    // Forward the origin so the API can validate it
    origin: request.nextUrl.origin,
  };

  // Only forward cookie if present (for state preservation)
  const cookie = request.headers.get('cookie');
  if (cookie) {
    requestHeaders.cookie = cookie;
  }

  let response: Response;
  try {
    response = await fetch(targetUrl.toString(), {
      method: 'GET',
      headers: requestHeaders,
      redirect: 'manual',
    });
  } catch (error) {
    console.error('Auth login fetch error:', error);
    return NextResponse.redirect(new URL('/no-access', request.url));
  }

  const location = response.headers.get('location');
  console.log('Auth response status:', response.status, 'location:', location);

  // If we got a redirect to Keycloak, relay the cookies
  if (location && location.includes('keycloak')) {
    const nextResponse = NextResponse.redirect(location);
    for (const cookie of response.headers.getSetCookie()) {
      nextResponse.headers.append('Set-Cookie', cookie);
    }
    return nextResponse;
  }

  // For other 3xx responses, follow them (in case of redirects)
  if (response.status >= 300 && response.status < 400 && location) {
    console.log('Following redirect to:', location);
    const nextResponse = NextResponse.redirect(location);
    for (const cookie of response.headers.getSetCookie()) {
      nextResponse.headers.append('Set-Cookie', cookie);
    }
    return nextResponse;
  }

  // If API returned HTML (200), try to find redirect URL in body
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('text/html')) {
    const body = await response.text();
    // Look for meta refresh or forms that might indicate redirect
    const metaRedirect = body.match(
      /<meta[^>]*http-equiv=["']refresh["'][^>]*content=["'][^;]*url=([^"']+)/i,
    );
    if (metaRedirect && metaRedirect[1]) {
      console.log('Found meta redirect:', metaRedirect[1]);
      return NextResponse.redirect(metaRedirect[1]);
    }
    console.log('Got HTML response, status:', response.status);
  }

  // Log response body for debugging if no location
  const body = await response.text().catch(() => 'Could not read body');
  console.error(
    'No redirect found, status:',
    response.status,
    'body preview:',
    body.substring(0, 300),
  );

  return NextResponse.redirect(new URL('/no-access', request.url));
}
