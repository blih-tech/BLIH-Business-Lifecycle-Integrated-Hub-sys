'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { getDefaultDashboardPath } from '@/shared/auth/dashboard-access';
import { useSession } from '@/shared/auth/use-session';

export function HomeRedirect(): null {
  const router = useRouter();
  const session = useSession();

  useEffect(() => {
    router.replace(getDefaultDashboardPath(session));
  }, [router, session]);

  return null;
}
