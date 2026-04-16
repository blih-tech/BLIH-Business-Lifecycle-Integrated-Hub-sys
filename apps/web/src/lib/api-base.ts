/**
 * True when the configured API base clearly targets a machine-local server.
 */
export function isLocalhostApiUrl(url: string): boolean {
  try {
    const { hostname } = new URL(url.includes('://') ? url : `http://${url}`);
    return (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname === '[::1]'
    );
  } catch {
    return /localhost|127\.0\.0\.1|0\.0\.0\.0/i.test(url);
  }
}

/**
 * Default public API used when Vercel (or any VERCEL=1 build) still has
 * NEXT_PUBLIC_API_URL pointing at localhost — browsers cannot reach that from the internet.
 * Override with NEXT_PUBLIC_API_URL_PRODUCTION in project settings.
 */
const DEFAULT_PRODUCTION_API_BASE = 'https://blihapi.blihmarketing.com/api/v1';

/**
 * Normalized API base URL (no trailing slash), including `/api/v1` when applicable.
 *
 * On Vercel, if NEXT_PUBLIC_API_URL is localhost, uses NEXT_PUBLIC_API_URL_PRODUCTION
 * or DEFAULT_PRODUCTION_API_BASE so the deployed app calls a reachable HTTPS API.
 */
export function getApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim();
  const base = raw ? raw.replace(/\/+$/, '') : 'http://localhost:5000/api/v1';

  const onVercel =
    process.env.VERCEL === '1' || process.env.NEXT_PUBLIC_BLIH_VERCEL === '1';

  if (onVercel && isLocalhostApiUrl(base)) {
    const prod =
      process.env.NEXT_PUBLIC_API_URL_PRODUCTION?.trim().replace(/\/+$/, '') ||
      '';
    return prod || DEFAULT_PRODUCTION_API_BASE;
  }

  return base;
}
