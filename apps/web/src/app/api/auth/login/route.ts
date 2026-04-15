import { createHash, randomBytes } from 'crypto';
import { type NextRequest, NextResponse } from 'next/server';

const KEYCLOAK_URL =
  process.env.KEYCLOAK_URL ?? 'https://keycloak.blihmarketing.com';
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM ?? 'blih';
// Must match the auth client used by the backend for code exchange
const KEYCLOAK_AUTH_CLIENT_ID =
  process.env.KEYCLOAK_AUTH_CLIENT_ID ?? 'blih-system-auth';

function createBase64Url(byteLength: number): string {
  return randomBytes(byteLength).toString('base64url');
}

function computeS256Challenge(verifier: string): string {
  return createHash('sha256').update(verifier).digest('base64url');
}

/**
 * Direct redirect to Keycloak login with PKCE + nonce.
 * Stores transient cookies on the Vercel domain so they survive
 * the round-trip through Keycloak back to /api/auth/callback.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const productionOrigin =
    process.env.NEXT_PUBLIC_FRONTEND_URL ?? request.nextUrl.origin;
  const redirect = request.nextUrl.searchParams.get('redirect') || '/dashboard';

  const callbackUrl = `${productionOrigin}/api/auth/callback`;

  // Generate PKCE verifier / challenge (S256)
  const codeVerifier = createBase64Url(64);
  const codeChallenge = computeS256Challenge(codeVerifier);
  const state = createBase64Url(32);
  const nonce = createBase64Url(32);

  // Build Keycloak authorization URL
  const authUrl = new URL(
    `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/auth`,
  );
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id', KEYCLOAK_AUTH_CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', callbackUrl);
  authUrl.searchParams.set('scope', 'openid profile email roles');
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('code_challenge', codeChallenge);
  authUrl.searchParams.set('code_challenge_method', 'S256');
  authUrl.searchParams.set('nonce', nonce);

  console.log('[AUTH] Redirecting to Keycloak with PKCE:', authUrl.toString());

  const cookieOpts = {
    httpOnly: true,
    secure: true,
    sameSite: 'lax' as const,
    maxAge: 600,
    path: '/',
  };

  const response = NextResponse.redirect(authUrl.toString());
  response.cookies.set('kc_state', state, cookieOpts);
  response.cookies.set('kc_verifier', codeVerifier, cookieOpts);
  response.cookies.set('kc_nonce', nonce, cookieOpts);
  response.cookies.set('kc_redirect', redirect, cookieOpts);
  response.cookies.set('kc_frontend_origin', productionOrigin, cookieOpts);
  // Tell the backend which redirect_uri was used so it can match during exchange
  response.cookies.set('kc_callback_uri', callbackUrl, cookieOpts);

  return response;
}
