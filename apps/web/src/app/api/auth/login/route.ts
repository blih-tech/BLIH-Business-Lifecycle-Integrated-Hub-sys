import { type NextRequest, NextResponse } from 'next/server';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';

/**
 * Proxies the login initiation to the NestJS API.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const origin = request.headers.get('origin') || request.nextUrl.origin;
  const targetUrl = new URL(`${API_BASE_URL}/auth/login`);

  request.nextUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.set(key, value);
  });

  if (!targetUrl.searchParams.has('redirect_origin')) {
    targetUrl.searchParams.set('redirect_origin', origin);
  }

  console.log('[AUTH] API_BASE_URL:', API_BASE_URL);
  console.log('[AUTH] Target URL:', targetUrl.toString());
  console.log('[AUTH] Origin:', origin);

  let response: Response;
  try {
    response = await fetch(targetUrl.toString(), {
      method: 'GET',
      headers: {
        origin: origin,
        accept: 'text/plain',
      },
      redirect: 'manual',
      signal: AbortSignal.timeout(10000),
    });
  } catch (error) {
    console.error('[AUTH] Fetch error:', error);
    return NextResponse.redirect(new URL('/no-access', request.url));
  }

  console.log('[AUTH] Response status:', response.status);

  // Check for any error status
  if (response.status >= 400) {
    const body = await response.text().catch(() => '');
    console.error(
      '[AUTH] Error response:',
      response.status,
      body.substring(0, 500),
    );
    return NextResponse.redirect(new URL('/no-access', request.url));
  }

  const location = response.headers.get('location');
  console.log('[AUTH] Location header:', location);

  if (location && location.includes('keycloak')) {
    const nextResponse = NextResponse.redirect(location);
    for (const setCookie of response.headers.getSetCookie()) {
      nextResponse.headers.append('Set-Cookie', setCookie);
    }
    return nextResponse;
  }

  if (response.status >= 300 && response.status < 400 && location) {
    const nextResponse = NextResponse.redirect(location);
    for (const setCookie of response.headers.getSetCookie()) {
      nextResponse.headers.append('Set-Cookie', setCookie);
    }
    return nextResponse;
  }

  console.error('[AUTH] No valid redirect found');
  return NextResponse.redirect(new URL('/no-access', request.url));
}
