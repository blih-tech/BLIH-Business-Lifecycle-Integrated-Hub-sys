import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_PROMPTS = new Set(['login', 'consent', 'none', 'select_account']);

function getApiBaseUrl(request: NextRequest): string {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (configured) {
    return configured.replace(/\/+$/, '');
  }

  const { hostname } = request.nextUrl;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5000/api/v1';
  }

  throw new Error(
    'NEXT_PUBLIC_API_URL is required when running outside localhost.',
  );
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
  let apiUrl: URL;
  try {
    apiUrl = new URL('auth/login', `${getApiBaseUrl(request)}/`);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Unable to resolve API base URL',
      },
      { status: 500 },
    );
  }

  const redirect = normalizeRedirectPath(
    incomingUrl.searchParams.get('redirect'),
    '/',
  );
  const prompt = incomingUrl.searchParams.get('prompt');
  const redirectOrigin =
    incomingUrl.searchParams.get('redirect_origin') ?? incomingUrl.origin;

  apiUrl.searchParams.set('redirect', redirect);

  if (prompt && ALLOWED_PROMPTS.has(prompt)) {
    apiUrl.searchParams.set('prompt', prompt);
  }

  if (redirectOrigin) {
    apiUrl.searchParams.set('redirect_origin', redirectOrigin);
  }

  return NextResponse.redirect(apiUrl);
}
