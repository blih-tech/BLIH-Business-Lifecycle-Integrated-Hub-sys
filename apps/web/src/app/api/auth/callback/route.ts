import { type NextRequest, NextResponse } from 'next/server';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';

/**
 * Proxies the OIDC authorization code callback to the NestJS API.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  console.log('[CALLBACK] Processing auth callback');

  const targetUrl = new URL(`${API_BASE_URL}/auth/callback`);

  // Forward all query params
  request.nextUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.set(key, value);
  });

  console.log('[CALLBACK] Calling API:', targetUrl.toString());

  let response: Response;
  try {
    response = await fetch(targetUrl.toString(), {
      method: 'GET',
      headers: {
        cookie: request.headers.get('cookie') ?? '',
        origin: request.nextUrl.origin,
      },
      redirect: 'manual',
    });
  } catch (error) {
    console.error('[CALLBACK] Fetch error:', error);
    return NextResponse.redirect(new URL('/no-access', request.url));
  }

  console.log('[CALLBACK] API response status:', response.status);

  const location = response.headers.get('location');
  console.log('[CALLBACK] Location:', location);

  // Check for errors - if no location or error status
  if (!location && response.status >= 400) {
    const body = await response.text().catch(() => '');
    console.error('[CALLBACK] API error:', response.status, body);
    return NextResponse.redirect(new URL('/no-access', request.url));
  }

  if (!location) {
    console.error('[CALLBACK] No location header from API');
    return NextResponse.redirect(new URL('/no-access', request.url));
  }

  // Resolve redirect target
  const redirectTo = location.startsWith('http')
    ? location
    : new URL(location, request.nextUrl.origin).toString();

  console.log('[CALLBACK] Redirecting to:', redirectTo);

  const nextResponse = NextResponse.redirect(redirectTo);

  // Relay cookies
  for (const cookie of response.headers.getSetCookie()) {
    nextResponse.headers.append('Set-Cookie', cookie);
  }

  return nextResponse;
}
