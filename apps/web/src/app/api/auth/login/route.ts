import { type NextRequest, NextResponse } from 'next/server';

const KEYCLOAK_URL =
  process.env.KEYCLOAK_URL ?? 'https://keycloak.blihmarketing.com';
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM ?? 'blih';
const KEYCLOAK_CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID ?? 'blih-system-auth';

/**
 * Direct redirect to Keycloak login - bypasses API entirely
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const redirectOrigin =
    request.nextUrl.searchParams.get('redirect_origin') ||
    request.nextUrl.origin;
  const redirect = request.nextUrl.searchParams.get('redirect') || '/dashboard';

  const callbackUrl = `${redirectOrigin}/api/auth/callback`;
  const state = Math.random().toString(36).substring(2);

  // Build Keycloak authorization URL directly
  const authUrl = new URL(
    `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/auth`,
  );
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id', KEYCLOAK_CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', callbackUrl);
  authUrl.searchParams.set('scope', 'openid profile email');
  authUrl.searchParams.set('state', state);

  console.log('[AUTH] Direct redirect to Keycloak:', authUrl.toString());

  // Set state cookie for verification later
  const response = NextResponse.redirect(authUrl.toString());
  response.cookies.set('kc_state', state, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 600,
  });
  response.cookies.set('kc_redirect', redirect, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 600,
  });
  response.cookies.set('kc_frontend_origin', redirectOrigin, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 600,
  });

  return response;
}
