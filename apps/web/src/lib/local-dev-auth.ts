/**
 * Split-origin session bridge: browser calls API /auth/me with credentials, then mirrors
 * profile into blih_local_session for Server Components. Only for local machine dev.
 *
 * Disabled on Vercel — use a public HTTPS NEXT_PUBLIC_API_URL (or NEXT_PUBLIC_API_URL_PRODUCTION)
 * and auth cookies on the API domain + CORS with credentials.
 */
export function isLocalDevSessionBridgeActive(): boolean {
  const onVercel =
    process.env.VERCEL === '1' || process.env.NEXT_PUBLIC_BLIH_VERCEL === '1';
  if (onVercel) {
    return false;
  }
  if (process.env.NEXT_PUBLIC_AUTH_LOCAL_SESSION_BRIDGE === 'false') {
    return false;
  }
  if (process.env.NEXT_PUBLIC_AUTH_LOCAL_SESSION_BRIDGE === 'true') {
    return true;
  }
  const api = process.env.NEXT_PUBLIC_API_URL ?? '';
  return (
    api.includes('localhost') ||
    api.includes('127.0.0.1') ||
    api.includes('0.0.0.0')
  );
}
