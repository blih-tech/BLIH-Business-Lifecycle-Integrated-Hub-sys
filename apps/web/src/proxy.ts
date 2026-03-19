import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const DEMO_MODE = process.env.DEMO_MODE === 'true';

export function proxy(request: NextRequest) {
  if (DEMO_MODE) {
    return NextResponse.next();
  }

  const hasAccessToken = request.cookies.has('kc_access');
  if (!hasAccessToken) {
    const currentPath = request.nextUrl.pathname;
    const loginUrl = new URL(`${API_BASE_URL}/auth/login`, request.url);
    loginUrl.searchParams.set('redirect', currentPath);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: '/',
};
