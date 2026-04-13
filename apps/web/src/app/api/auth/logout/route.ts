import { getApiBaseUrl } from '@/lib/api-base';
import { LOCAL_SESSION_COOKIE } from '@/lib/auth-constants';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const currentPath = new URL(request.url).pathname;
  const logoutUrl = new URL(`${getApiBaseUrl()}/auth/logout`, request.url);
  logoutUrl.searchParams.set('redirect', currentPath);
  const res = NextResponse.redirect(logoutUrl);
  res.cookies.set(LOCAL_SESSION_COOKIE, '', {
    path: '/',
    maxAge: 0,
  });
  return res;
}
