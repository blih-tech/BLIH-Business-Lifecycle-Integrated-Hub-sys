import { type NextRequest, NextResponse } from 'next/server';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') ??
  'https://blihapi.blihmarketing.com';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const hasCode = request.nextUrl.searchParams.has('code');
  const hasState = request.nextUrl.searchParams.has('state');

  if (!hasCode || !hasState) {
    return NextResponse.redirect(new URL('/api/auth/login', request.url));
  }

  const callbackUrl = new URL(`${API_BASE_URL}/api/v1/auth/callback`);

  request.nextUrl.searchParams.forEach((value, key) => {
    callbackUrl.searchParams.set(key, value);
  });

  callbackUrl.searchParams.set(
    'redirect_uri',
    `${request.nextUrl.origin}/api/auth/callback`,
  );

  return NextResponse.redirect(callbackUrl);
}
