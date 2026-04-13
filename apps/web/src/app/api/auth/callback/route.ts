import { type NextRequest, NextResponse } from 'next/server';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';

export async function GET(request: NextRequest): Promise<NextResponse> {
  console.log('[CALLBACK] Processing auth callback');

  // Check if there are query params
  const hasCode = request.nextUrl.searchParams.has('code');
  const hasState = request.nextUrl.searchParams.has('state');
  console.log('[CALLBACK] Has code:', hasCode, 'Has state:', hasState);

  if (!hasCode) {
    console.log('[CALLBACK] No code param, redirecting to login');
    return NextResponse.redirect(new URL('/api/auth/login', request.url));
  }

  const targetUrl = new URL(`${API_BASE_URL}/auth/callback`);

  request.nextUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.set(key, value);
  });

  const cookieHeader = request.headers.get('cookie') ?? '';
  console.log('[CALLBACK] Forwarding to API:', targetUrl.toString());

  try {
    const response = await fetch(targetUrl.toString(), {
      method: 'GET',
      headers: {
        cookie: cookieHeader,
        origin: request.nextUrl.origin,
      },
      redirect: 'manual',
      signal: AbortSignal.timeout(15000),
    });

    console.log('[CALLBACK] API responded with status:', response.status);

    const location = response.headers.get('location');
    console.log('[CALLBACK] Location from API:', location);

    if (location) {
      // Forward the redirect with cookies
      const nextResponse = NextResponse.redirect(location);
      for (const cookie of response.headers.getSetCookie()) {
        nextResponse.headers.append('Set-Cookie', cookie);
      }
      console.log('[CALLBACK] Redirecting to:', location);
      return nextResponse;
    }

    // No location - check body
    const body = await response.text();
    console.log('[CALLBACK] No location, body:', body.substring(0, 200));

    // Try to extract redirect from body or default
    const nextResponse = NextResponse.redirect(
      new URL('/dashboard', request.url),
    );
    for (const cookie of response.headers.getSetCookie()) {
      nextResponse.headers.append('Set-Cookie', cookie);
    }
    return nextResponse;
  } catch (error) {
    console.error('[CALLBACK] Error calling API:', error);
    // On error, still try to redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
}
