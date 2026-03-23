import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing env: ${name}`);
  }
  return value;
}

function buildTokenUrl(): string {
  const base = requireEnv('KEYCLOAK_URL').replace(/\/+$/, '');
  const realm = requireEnv('KEYCLOAK_REALM');
  return `${base}/realms/${realm}/protocol/openid-connect/token`;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  const cookieJar = await cookies();
  const storedState = cookieJar.get('kc_state')?.value;
  const codeVerifier = cookieJar.get('kc_verifier')?.value;

  if (
    !code ||
    !state ||
    !storedState ||
    state !== storedState ||
    !codeVerifier
  ) {
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json(
        {
          error: 'invalid_state',
          code: Boolean(code),
          state,
          storedState,
          hasVerifier: Boolean(codeVerifier),
          callbackUrl: url.toString(),
        },
        { status: 400 },
      );
    }
    return NextResponse.redirect(
      new URL('/auth/signin?error=invalid_state', url),
    );
  }

  const clientId = requireEnv('KEYCLOAK_CLIENT_ID');
  const redirectUri = requireEnv('KEYCLOAK_REDIRECT_URI');

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    client_id: clientId,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
  });

  const tokenResponse = await fetch(buildTokenUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!tokenResponse.ok) {
    return NextResponse.redirect(
      new URL('/auth/signin?error=token_exchange', url),
    );
  }

  const tokenJson = (await tokenResponse.json()) as {
    access_token: string;
    refresh_token?: string;
    id_token?: string;
    expires_in?: number;
    refresh_expires_in?: number;
  };

  const response = NextResponse.redirect(new URL('/', url));

  response.cookies.set('kc_access', tokenJson.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: tokenJson.expires_in ?? 300,
  });

  if (tokenJson.refresh_token) {
    response.cookies.set('kc_refresh', tokenJson.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: tokenJson.refresh_expires_in ?? 1800,
    });
  }

  if (tokenJson.id_token) {
    response.cookies.set('kc_id', tokenJson.id_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: tokenJson.refresh_expires_in ?? tokenJson.expires_in ?? 1800,
    });
  }

  response.cookies.delete('kc_state');
  response.cookies.delete('kc_verifier');
  response.cookies.delete('kc_nonce');

  return response;
}
