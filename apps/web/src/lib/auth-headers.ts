import { LOCAL_STORAGE_ACCESS_KEY } from '@/lib/auth-constants';

/**
 * Authorization header for browser-side API calls (local dev bearer bridge).
 */
export function getBrowserAuthorizationHeader(): Record<string, string> {
  if (typeof window === 'undefined') {
    return {};
  }
  const token =
    localStorage.getItem(LOCAL_STORAGE_ACCESS_KEY) ||
    localStorage.getItem('token') ||
    '';
  return token ? { Authorization: `Bearer ${token}` } : {};
}
