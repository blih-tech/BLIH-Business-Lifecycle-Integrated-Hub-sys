import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const hasCode = request.nextUrl.searchParams.has('code');

  if (!hasCode) {
    return NextResponse.redirect(new URL('/api/auth/login', request.url));
  }

  // Call the API to exchange code for tokens
  // This will set kc_access, kc_refresh, etc cookies
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';
  const targetUrl = new URL(`${API_BASE_URL}/auth/callback`);

  request.nextUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.set(key, value);
  });

  try {
    const response = await fetch(targetUrl.toString(), {
      method: 'GET',
      headers: {
        cookie: request.headers.get('cookie') ?? '',
        origin: request.nextUrl.origin,
      },
      redirect: 'manual',
      signal: AbortSignal.timeout(15000),
    });

    // Forward any cookies from API
    const nextResponse = NextResponse.redirect(
      new URL('/dashboard?login=1', request.url),
    );

    for (const cookie of response.headers.getSetCookie()) {
      nextResponse.headers.append('Set-Cookie', cookie);
    }

    return nextResponse;
  } catch (error) {
    console.error('[CALLBACK] API error:', error);
    // Even on error, redirect to dashboard - let it handle auth check
    return NextResponse.redirect(new URL('/dashboard?login=1', request.url));
  }
}
