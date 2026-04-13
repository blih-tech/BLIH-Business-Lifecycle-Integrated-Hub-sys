import { type NextRequest, NextResponse } from 'next/server';

const ACCESS_TOKEN_COOKIE = 'kc_access';

function extractCookie(cookieHeader: string, name: string): string | null {
  const pairs = cookieHeader.split(';').map((c) => c.trim());
  for (const pair of pairs) {
    if (pair.startsWith(name + '=')) {
      return pair.slice(name.length + 1);
    }
  }
  return null;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const hasCode = request.nextUrl.searchParams.has('code');

  if (!hasCode) {
    return NextResponse.redirect(new URL('/api/auth/login', request.url));
  }

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';
  const targetUrl = new URL(`${API_BASE_URL}/auth/callback`);

  request.nextUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.set(key, value);
  });

  const originalCookie = request.headers.get('cookie') ?? '';

  try {
    const response = await fetch(targetUrl.toString(), {
      method: 'GET',
      headers: {
        cookie: originalCookie,
        origin: request.nextUrl.origin,
      },
      redirect: 'manual',
      signal: AbortSignal.timeout(15000),
    });

    const setCookies = response.headers.getSetCookie();
    const allCookieHeader = setCookies.join('; ');
    const accessToken = extractCookie(allCookieHeader, ACCESS_TOKEN_COOKIE);

    console.log('[CALLBACK] Access token extracted:', !!accessToken);
    console.log('[CALLBACK] Set-Cookie count:', setCookies.length);

    if (!accessToken) {
      console.error('[CALLBACK] No access token in API response');
      return NextResponse.redirect(
        new URL('/no-access?error=no_token', request.url),
      );
    }

    const nextResponse = NextResponse.redirect(
      new URL('/dashboard?login=1', request.url),
    );

    const FE_TOKEN_MAX_AGE = 300;
    nextResponse.cookies.set(ACCESS_TOKEN_COOKIE, accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: FE_TOKEN_MAX_AGE,
      path: '/',
    });

    console.log('[CALLBACK] Set token cookie for frontend');

    return nextResponse;
  } catch (error) {
    console.error('[CALLBACK] API error:', error);
    return NextResponse.redirect(
      new URL('/no-access?error=api_error', request.url),
    );
  }
}
