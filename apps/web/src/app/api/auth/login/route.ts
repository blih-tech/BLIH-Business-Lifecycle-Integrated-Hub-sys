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

  const requestHeaders: Record<string, string> = {
    origin: origin,
    accept: 'text/plain',
  };

  const cookie = request.headers.get('cookie');
  if (cookie) {
    requestHeaders.cookie = cookie;
  }

  console.log('Calling API:', targetUrl.toString(), 'with origin:', origin);

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
  console.log('API response status:', response.status, 'location:', location);

  if (location && location.includes('keycloak')) {
    const nextResponse = NextResponse.redirect(location);
    for (const setCookie of response.headers.getSetCookie()) {
      nextResponse.headers.append('Set-Cookie', setCookie);
    }
    console.log('Redirecting to Keycloak with cookies');
    return nextResponse;
  }

  if (response.status >= 300 && response.status < 400 && location) {
    console.log('Following redirect to:', location);
    const nextResponse = NextResponse.redirect(location);
    for (const setCookie of response.headers.getSetCookie()) {
      nextResponse.headers.append('Set-Cookie', setCookie);
    }
    return nextResponse;
  }

  const allHeaders: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    allHeaders[key] = value;
  });
  console.log('All response headers:', JSON.stringify(allHeaders));

  const body = await response.text().catch(() => 'Could not read body');
  console.error(
    'No redirect found, status:',
    response.status,
    'body preview:',
    body.substring(0, 300),
  );

  return NextResponse.redirect(new URL('/no-access', request.url));
}
