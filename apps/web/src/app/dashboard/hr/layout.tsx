import { redirect } from 'next/navigation';

import { HrDashboardFrame } from '@/app/dashboard/hr/HrDashboardFrame';
import { getSession } from '@/shared/auth/session';
import { isAuthorizedForDashboard } from '@/shared/auth/role-routing';

const DEMO_MODE = process.env.DEMO_MODE === 'true';

type HrDashboardLayoutProps = {
  children: React.ReactNode;
};

function getInitialsFromName(
  firstName: string | null,
  lastName: string | null,
  fallback: string | null,
): string {
  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  }
  const value = firstName ?? lastName ?? fallback;
  if (!value) return '??';
  const trimmed = value.trim();
  if (!trimmed) return '??';
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '??';
  if (parts.length === 1) {
    const only = parts[0];
    if (!only) return '??';
    return only.slice(0, 2).toUpperCase();
  }
  const firstPart = parts[0];
  const lastPart = parts.at(-1);
  if (!firstPart || !lastPart) return '??';
  const first = firstPart[0] ?? '';
  const last = lastPart[0] ?? '';
  const initials = `${first}${last}`.toUpperCase();
  return initials || '??';
}

function getDisplayName(
  firstName: string | null,
  lastName: string | null,
  username: string | null,
  email: string | null,
): string {
  if (firstName && lastName) return `${firstName} ${lastName}`;
  if (firstName) return firstName;
  if (lastName) return lastName;
  if (username) return username;
  if (email) return email;
  return 'User';
}

export default async function HrDashboardLayout({
  children,
}: HrDashboardLayoutProps) {
  const session = await getSession();
  console.log('[HrDashboardLayout] Session:', JSON.stringify(session, null, 2));

  if (!DEMO_MODE) {
    if (!session.authenticated) {
      const currentUrl = `/dashboard/hr?from=${Date.now()}`;
      redirect(
        `/api/auth/login?redirect_uri=${encodeURIComponent(currentUrl)}`,
      );
    }
    if (!isAuthorizedForDashboard('hr', session.roles)) {
      redirect('/no-access?error=unauthorized');
    }
  }

  const userName = getDisplayName(
    session.firstName,
    session.lastName,
    session.username,
    session.email,
  );
  const userEmail = session.email ?? 'user@blih.local';
  const initials = getInitialsFromName(
    session.firstName,
    session.lastName,
    session.username ?? session.email,
  );

  console.log(
    '[HrDashboardLayout] User info - name:',
    userName,
    'email:',
    userEmail,
    'initials:',
    initials,
  );

  return (
    <HrDashboardFrame
      user={{
        initials,
        name: userName,
        email: userEmail,
      }}
    >
      {children}
    </HrDashboardFrame>
  );
}
