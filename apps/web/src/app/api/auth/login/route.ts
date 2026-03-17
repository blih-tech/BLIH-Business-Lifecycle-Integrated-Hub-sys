import { NextResponse } from 'next/server';
import { createHash, randomBytes } from 'node:crypto';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing env: ${name}`);
  }
  return value;
}

function base64UrlEncode(buffer: Buffer): string {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function buildKeycloakBase(): string {
  const base = requireEnv('KEYCLOAK_URL').replace(/\/+$/, '');
  const realm = requireEnv('KEYCLOAK_REALM');
  return `${base}/realms/${realm}`;
}

function buildAuthUrl({
  redirectUri,
  clientId,
  state,
  nonce,
  codeChallenge,
}: {
  redirectUri: string;
  clientId: string;
  state: string;
  nonce: string;
  codeChallenge: string;
}): string {
  const url = new URL(`${buildKeycloakBase()}/protocol/openid-connect/auth`);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('scope', 'openid');
  url.searchParams.set('state', state);
  url.searchParams.set('nonce', nonce);
  url.searchParams.set('code_challenge', codeChallenge);
  url.searchParams.set('code_challenge_method', 'S256');
  return url.toString();
}

export async function GET(request: Request) {
  console.log(request);
  const clientId = requireEnv('KEYCLOAK_CLIENT_ID');
  const redirectUri = requireEnv('KEYCLOAK_REDIRECT_URI');

  const state = base64UrlEncode(randomBytes(16));
  const nonce = base64UrlEncode(randomBytes(16));
  const codeVerifier = base64UrlEncode(randomBytes(32));
  const codeChallenge = base64UrlEncode(
    createHash('sha256').update(codeVerifier).digest(),
  );

  const redirectUrl = buildAuthUrl({
    redirectUri,
    clientId,
    state,
    nonce,
    codeChallenge,
  });

  const response = NextResponse.redirect(redirectUrl);
  response.cookies.set('kc_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 10 * 60,
    path: '/',
  });
  response.cookies.set('kc_verifier', codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 10 * 60,
    path: '/',
  });
  response.cookies.set('kc_nonce', nonce, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 10 * 60,
    path: '/',
  });

  return response;
}
