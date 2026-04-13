import { type NextRequest, NextResponse } from 'next/server';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';

export async function GET(request: NextRequest): Promise<NextResponse> {
  console.log('[CALLBACK] Processing auth callback');

  const targetUrl = new URL(`${API_BASE_URL}/auth/callback`);

  request.nextUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.set(key, value);
  });

  console.log('[CALLBACK] Calling API:', targetUrl.toString());

  const cookieHeader = request.headers.get('cookie') ?? '';
  console.log('[CALLBACK] Cookies forwarded:', cookieHeader.substring(0, 200));

  let response: Response;
  try {
    response = await fetch(targetUrl.toString(), {
      method: 'GET',
      headers: {
        cookie: cookieHeader,
        origin: request.nextUrl.origin,
      },
      redirect: 'manual',
    });
  } catch (error) {
    console.error('[CALLBACK] Fetch error:', error);
    return NextResponse.redirect(new URL('/no-access', request.url));
  }

  console.log('[CALLBACK] API response status:', response.status);

  const locationHeader = response.headers.get('location');
  console.log('[CALLBACK] Location:', locationHeader);

  if (!locationHeader) {
    const body = await response.text().catch(() => '');
    console.log(
      '[CALLBACK] No location, body preview:',
      body.substring(0, 300),
    );
    console.log('[CALLBACK] Response ok:', response.ok);

    if (body.includes('dashboard') || response.ok) {
      console.log('[CALLBACK] Redirecting to dashboard');
      const nextResponse = NextResponse.redirect(
        new URL('/dashboard', request.url),
      );
      for (const cookie of response.headers.getSetCookie()) {
        nextResponse.headers.append('Set-Cookie', cookie);
      }
      return nextResponse;
    }

    console.error('[CALLBACK] No location header from API, going to no-access');
    return NextResponse.redirect(new URL('/no-access', request.url));
  }

  const allHeaders: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    allHeaders[key] = value;
  });
  console.log('[CALLBACK] All headers:', JSON.stringify(allHeaders));

  if (response.status >= 400) {
    const body = await response.text().catch(() => '');
    console.error('[CALLBACK] API error:', response.status, body);
    return NextResponse.redirect(new URL('/no-access', request.url));
  }

  const redirectTo = locationHeader.startsWith('http')
    ? locationHeader
    : new URL(locationHeader, request.nextUrl.origin).toString();

  console.log('[CALLBACK] Redirecting to:', redirectTo);

  const nextResponse = NextResponse.redirect(redirectTo);

  for (const cookie of response.headers.getSetCookie()) {
    nextResponse.headers.append('Set-Cookie', cookie);
  }

  return nextResponse;
}
