import { getApiBaseUrl } from '@/lib/api-base';
import { type NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = getApiBaseUrl();

export async function GET(request: NextRequest): Promise<NextResponse> {
  const targetUrl = new URL(`${API_BASE_URL}/auth/login`);

  request.nextUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.set(key, value);
  });

  if (!targetUrl.searchParams.has('redirect_origin')) {
    targetUrl.searchParams.set('redirect_origin', request.nextUrl.origin);
  }

  return NextResponse.redirect(targetUrl.toString());
}
