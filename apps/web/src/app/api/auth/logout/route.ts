import { NextRequest, NextResponse } from 'next/server';

function getApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (configured) {
    return configured.replace(/\/+$/, '');
  }

  return 'http://localhost:5000/api/v1';
}

function normalizeRedirectPath(value: string | null, fallback: string): string {
  if (!value) {
    return fallback;
  }

  const candidate = value.trim();
  if (!candidate.startsWith('/') || candidate.startsWith('//')) {
    return fallback;
  }

  return candidate;
}

export async function GET(request: NextRequest) {
  const incomingUrl = new URL(request.url);
  const apiUrl = new URL('auth/logout', `${getApiBaseUrl()}/`);

  const redirect = normalizeRedirectPath(
    incomingUrl.searchParams.get('redirect'),
    '/',
  );
  const redirectOrigin =
    incomingUrl.searchParams.get('redirect_origin') ?? incomingUrl.origin;

  apiUrl.searchParams.set('redirect', redirect);

  if (redirectOrigin) {
    apiUrl.searchParams.set('redirect_origin', redirectOrigin);
  }

  return NextResponse.redirect(apiUrl);
}
