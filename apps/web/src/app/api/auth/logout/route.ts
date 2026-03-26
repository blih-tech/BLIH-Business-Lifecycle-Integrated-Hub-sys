import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(request: Request) {
  const currentPath = new URL(request.url).pathname;
  const logoutUrl = new URL(`${API_BASE_URL}/auth/logout`, request.url);
  logoutUrl.searchParams.set('redirect', currentPath);
  return NextResponse.redirect(logoutUrl);
}
