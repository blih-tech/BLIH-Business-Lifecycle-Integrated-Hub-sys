'use client';

import * as React from 'react';

import { SessionProvider } from './use-session';
import type { WebSession } from './session';

type AuthMeResponse = {
  data?: {
    id?: string;
    sub?: string;
    username?: string | null;
    email?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    roles?: string[];
    permissions?: string[];
  };
};

function getApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (configured) {
    return configured.replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined') {
    const { hostname } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000/api/v1';
    }
  }
  throw new Error('NEXT_PUBLIC_API_URL is not set.');
}

function redirectToLogin(): void {
  const { origin, pathname, search } = window.location;
  const loginUrl = new URL('/api/auth/login', origin);
  loginUrl.searchParams.set('redirect', `${pathname}${search}` || '/');
  loginUrl.searchParams.set('redirect_origin', origin);
  window.location.replace(loginUrl.toString());
}

type GateState =
  | { status: 'loading' }
  | { status: 'ready'; session: WebSession }
  | { status: 'redirecting' };

export function AuthGate({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}): React.ReactElement | null {
  const [state, setState] = React.useState<GateState>({ status: 'loading' });

  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const response = await fetch(`${getApiBaseUrl()}/auth/me`, {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        });

        if (cancelled) return;

        if (response.status === 401 || response.status === 403) {
          setState({ status: 'redirecting' });
          redirectToLogin();
          return;
        }

        if (!response.ok) {
          // Surface a non-redirect failure so we don't silently loop on 5xx.
          setState({ status: 'redirecting' });
          redirectToLogin();
          return;
        }

        const payload = (await response.json()) as AuthMeResponse;
        const profile = payload.data;

        if (!profile?.sub) {
          setState({ status: 'redirecting' });
          redirectToLogin();
          return;
        }

        setState({
          status: 'ready',
          session: {
            authenticated: true,
            roles: Array.isArray(profile.roles) ? profile.roles : [],
            permissions: Array.isArray(profile.permissions)
              ? profile.permissions
              : [],
            userId: typeof profile.id === 'string' ? profile.id : null,
            sub: typeof profile.sub === 'string' ? profile.sub : null,
            username: profile.username ?? null,
            email: profile.email ?? null,
            firstName: profile.firstName ?? null,
            lastName: profile.lastName ?? null,
          },
        });
      } catch {
        if (cancelled) return;
        setState({ status: 'redirecting' });
        redirectToLogin();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (state.status === 'ready') {
    return (
      <SessionProvider session={state.session}>{children}</SessionProvider>
    );
  }

  return <>{fallback ?? null}</>;
}
