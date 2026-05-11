import type { ReactNode } from 'react';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { getAccessDeniedRedirect } from '@/shared/auth/dashboard-access';
import { getSession } from '@/shared/auth/session';

const DEMO_MODE = process.env.DEMO_MODE === 'true';

function buildLoginRedirect(pathname: string): string {
  const login = new URL('/api/auth/login', 'http://local');
  login.searchParams.set('redirect', pathname);
  return `${login.pathname}${login.search}`;
}

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const headerList = await headers();
  const pathname = headerList.get('x-pathname') ?? '/hr';
  const session = await getSession();

  if (!DEMO_MODE) {
    if (!session.authenticated) {
      redirect(buildLoginRedirect(pathname));
    }

    const denied = getAccessDeniedRedirect(pathname, session);
    if (denied) {
      redirect(denied);
    }
  }

  return children;
}
