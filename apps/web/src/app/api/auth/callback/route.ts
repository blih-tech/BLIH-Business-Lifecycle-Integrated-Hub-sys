import { type NextRequest, NextResponse } from 'next/server';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'https://blihapi.blihmarketing.com/api/v1';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const hasCode = request.nextUrl.searchParams.has('code');

  if (!hasCode) {
    return NextResponse.redirect(new URL('/api/auth/login', request.url));
  }

  const targetUrl = new URL(`${API_BASE_URL}/auth/callback`);

  request.nextUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.set(key, value);
  });

  const originalCookies = request.headers.get('cookie') ?? '';
  console.log('[CALLBACK] Forwarding cookies:', originalCookies.slice(0, 100));

  try {
    const response = await fetch(targetUrl.toString(), {
      method: 'GET',
      headers: {
        cookie: originalCookies,
        origin: request.nextUrl.origin,
      },
      redirect: 'manual',
    });

    const location = response.headers.get('location');
    const setCookies = response.headers.getSetCookie();

    console.log('[CALLBACK] API status:', response.status);
    console.log('[CALLBACK] Set-Cookie count:', setCookies.length);

    if (setCookies.some((c) => c.startsWith('kc_access='))) {
      const redirectTo = location ?? '/dashboard?login=1';
      const nextResponse = NextResponse.redirect(
        new URL(redirectTo, request.url),
      );

      for (const cookie of setCookies) {
        nextResponse.headers.append('Set-Cookie', cookie);
      }

      return nextResponse;
    }

    return NextResponse.redirect(
      new URL('/no-access?error=api_failed', request.url),
    );
  } catch (error) {
    console.error('[CALLBACK] Error:', error);
    return NextResponse.redirect(
      new URL('/no-access?error=api_error', request.url),
    );
  }
}
