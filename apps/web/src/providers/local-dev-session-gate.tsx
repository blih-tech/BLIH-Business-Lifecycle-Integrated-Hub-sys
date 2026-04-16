'use client';

import { getApiBaseUrl } from '@/lib/api-base';
import { isLocalDevSessionBridgeActive } from '@/lib/local-dev-auth';
import {
  buildLocalDevLoginUrl,
  clearLocalSessionCookie,
  setLocalSessionCookieFromMeData,
} from '@/lib/local-session-cookie.client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const AUTH_DEBUG = process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true';

type MeEnvelope = {
  success?: boolean;
  data?: {
    roles?: string[];
    username?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
  };
};

/**
 * Blocks the UI briefly on local split-origin dev so we can call /auth/me from the browser
 * (sends kc_* cookies to the API), then mirrors the result into a first-party cookie for SSR.
 */
export function LocalDevSessionGate({
  children,
}: {
  children: React.ReactNode;
}): React.ReactNode {
  const active = isLocalDevSessionBridgeActive();
  const [ready, setReady] = useState(!active);
  const router = useRouter();

  useEffect(() => {
    if (!active) {
      return;
    }

    void (async () => {
      try {
        const api = getApiBaseUrl();
        const meUrl = `${api}/auth/me`;
        if (AUTH_DEBUG) {
          console.log(
            '[LocalDevSessionGate] GET',
            meUrl,
            '(credentials: include)',
          );
        }

        const res = await fetch(meUrl, {
          method: 'GET',
          credentials: 'include',
        });

        if (AUTH_DEBUG) {
          console.log('[LocalDevSessionGate] /auth/me status:', res.status);
        }

        if (res.status === 401) {
          clearLocalSessionCookie();
          window.location.href = buildLocalDevLoginUrl();
          return;
        }

        if (!res.ok) {
          if (AUTH_DEBUG) {
            console.warn('[LocalDevSessionGate] /auth/me failed', res.status);
          }
          setReady(true);
          return;
        }

        const envelope = (await res.json()) as MeEnvelope;
        const user = envelope.data;
        if (user && AUTH_DEBUG) {
          console.log('[LocalDevSessionGate] /auth/me roles:', user.roles);
        }
        if (user) {
          setLocalSessionCookieFromMeData(user);
          // Server may have redirected here (e.g. Home → /no-access) before the cookie existed.
          if (window.location.pathname === '/no-access') {
            router.replace('/');
          } else {
            router.refresh();
          }
        }
      } catch (e) {
        if (AUTH_DEBUG) {
          console.warn('[LocalDevSessionGate] error', e);
        }
      } finally {
        setReady(true);
      }
    })();
  }, [active, router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Loading session…
      </div>
    );
  }

  return <>{children}</>;
}
