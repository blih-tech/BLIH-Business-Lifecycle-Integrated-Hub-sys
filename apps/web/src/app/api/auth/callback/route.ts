import { type NextRequest, NextResponse } from 'next/server';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://blihapi.blihmarketing.com/api/v1';

function extractTokenFromCookie(cookieStr: string): string | null {
  const cookiePart = cookieStr.split(';')[0] ?? '';
  const parts = cookiePart.split('=');
  return parts[1] ?? null;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const hasCode = request.nextUrl.searchParams.has('code');
  const hasError = request.nextUrl.searchParams.has('error');

  if (!hasCode) {
    if (hasError) {
      const errorDesc =
        request.nextUrl.searchParams.get('error_description') ??
        request.nextUrl.searchParams.get('error') ??
        'auth_failed';
      return NextResponse.redirect(
        new URL(`/no-access?error=${errorDesc}`, request.url),
      );
    }
    return NextResponse.redirect(
      new URL('/?redirect=%2Fdashboard', request.url),
    );
  }

  const targetUrl = new URL(`${API_BASE_URL}/auth/callback`);

  for (const [key, value] of request.nextUrl.searchParams) {
    targetUrl.searchParams.set(key, value);
  }

  const originalCookies = request.headers.get('cookie') ?? '';
  console.log('[CALLBACK] Total cookies length:', originalCookies.length);
  console.log('[CALLBACK] Has kc_state:', originalCookies.includes('kc_state'));
  console.log(
    '[CALLBACK] Has kc_verifier:',
    originalCookies.includes('kc_verifier'),
  );
  console.log(
    '[CALLBACK] Has kc_redirect:',
    originalCookies.includes('kc_redirect'),
  );
  console.log('[CALLBACK] Forwarding cookies:', originalCookies.slice(0, 200));

  try {
    const response = await fetch(targetUrl.toString(), {
      method: 'GET',
      headers: {
        cookie: originalCookies,
        origin: request.nextUrl.origin,
        'cache-control': 'no-cache',
      },
      credentials: 'same-origin',
      redirect: 'manual',
    });

    const location = response.headers.get('location');
    const setCookies = response.headers.getSetCookie();

    console.log('[CALLBACK] API status:', response.status);
    console.log('[CALLBACK] Set-Cookie count:', setCookies.length);
    console.log('[CALLBACK] Set-Cookies:', setCookies);
    console.log('[CALLBACK] API location:', location);

    const hasAccess = setCookies.some((c) => c.startsWith('kc_access='));
    console.log('[CALLBACK] Has access cookie:', hasAccess);

    if (!hasAccess) {
      const bodyText = await response.text().catch(() => 'unable to read body');
      console.log('[CALLBACK] Response body:', bodyText.slice(0, 500));
    }

    if (hasAccess) {
      const redirectTo = location ?? '/dashboard?login=1';
      const nextResponse = NextResponse.redirect(
        new URL(redirectTo, request.url),
      );

      for (const cookie of setCookies) {
        if (cookie.startsWith('kc_access=')) {
          const token = extractTokenFromCookie(cookie);
          if (token) {
            // httpOnly cookie — used by server-side session checks (getSession)
            nextResponse.cookies.set('kc_access', token, {
              httpOnly: true,
              secure: true,
              sameSite: 'none',
              maxAge: 300,
              path: '/',
            });
            // JS-readable cookie — used by apiClient to send Bearer token
            // to the external API (cross-domain, so credentials: include won't work)
            nextResponse.cookies.set('kc_token', token, {
              httpOnly: false,
              secure: true,
              sameSite: 'none',
              maxAge: 300,
              path: '/',
            });
          }
        } else if (cookie.startsWith('kc_refresh=')) {
          const token = extractTokenFromCookie(cookie);
          if (token) {
            nextResponse.cookies.set('kc_refresh', token, {
              httpOnly: true,
              secure: true,
              sameSite: 'none',
              maxAge: 2592000,
              path: '/',
            });
          }
        } else {
          nextResponse.headers.append('Set-Cookie', cookie);
        }
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
