'use client';

import { Button } from '@/shared/components/ui/button';
import { getApiBaseUrl, isLocalhostApiUrl } from '@/lib/api-base';
import { useEffect, useState } from 'react';

export function NoAccessContent(): React.ReactElement {
  const [host, setHost] = useState<string | null>(null);

  useEffect(() => {
    setHost(window.location.hostname);
  }, []);

  const envApi = process.env.NEXT_PUBLIC_API_URL?.trim() ?? '';
  const effectiveApi = getApiBaseUrl();
  const envPointsLocal = envApi ? isLocalhostApiUrl(envApi) : false;
  const onVercel = host !== null && host.endsWith('.vercel.app');
  const onVercelBuild = process.env.NEXT_PUBLIC_BLIH_VERCEL === '1';
  const showDeployHint = Boolean((onVercel || onVercelBuild) && envPointsLocal);
  const showCookieHint =
    host === 'localhost' || host === '127.0.0.1' || host === '[::1]';

  return (
    <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <div className="mx-auto w-full max-w-lg space-y-4 rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight">
          Access Required
        </h1>
        <p className="text-sm text-muted-foreground">
          We could not send you to a dashboard. That usually means one of the
          following:
        </p>
        <ul className="list-disc pl-5 text-left text-sm text-muted-foreground">
          <li>
            Your account is signed in, but Keycloak did not include a recognized
            role in the token (expected examples:{' '}
            <code className="text-xs">hr</code>,{' '}
            <code className="text-xs">hr_manager</code>,{' '}
            <code className="text-xs">hr_assistant</code>, or another dashboard
            role). Ask an admin to assign a realm role in Keycloak.
          </li>
          <li>
            You are not fully signed in, or the browser cannot reach the API
            with your session cookies (common on deployed previews if the API
            URL still points at <code className="text-xs">localhost</code>).
          </li>
        </ul>

        {showDeployHint ? (
          <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-left text-xs text-amber-950 dark:text-amber-100">
            <p className="font-medium">Deployed app configuration</p>
            <p className="mt-1">
              This build had <code>NEXT_PUBLIC_API_URL</code> set to a localhost
              URL, which browsers cannot reach from the internet. The app is now
              using this effective API base instead:{' '}
              <code className="break-all">{effectiveApi}</code>
            </p>
            <p className="mt-2">
              Set <code>NEXT_PUBLIC_API_URL_PRODUCTION</code> (or change{' '}
              <code>NEXT_PUBLIC_API_URL</code>) in Vercel to your real HTTPS
              API. Ensure CORS allows this origin with credentials, and Keycloak
              redirect URIs include your preview URL if needed.
            </p>
          </div>
        ) : null}

        {showCookieHint ? (
          <p className="text-left text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Local dev tip:</span>{' '}
            Session cookies <code className="text-[0.7rem]">kc_access</code> are
            set on the <strong>API</strong> origin (e.g.{' '}
            <code className="text-[0.7rem]">http://localhost:5000</code>). In
            DevTools → Application → Cookies, select that host — it only appears
            after the OAuth callback hits the API. The app origin (
            <code className="text-[0.7rem]">localhost:3000</code>) may only show{' '}
            <code className="text-[0.7rem]">blih_local_session</code>.
          </p>
        ) : null}

        <div className="flex justify-center gap-3 pt-2">
          <Button asChild>
            <a href="/dashboard">Go to Dashboard</a>
          </Button>
          <Button variant="secondary" asChild>
            <a href="/api/auth/logout">Sign Out</a>
          </Button>
        </div>
      </div>
    </main>
  );
}
