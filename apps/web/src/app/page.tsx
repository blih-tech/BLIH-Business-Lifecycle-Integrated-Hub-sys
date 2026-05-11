import { redirect } from 'next/navigation';

import { getDefaultDashboardPath } from '@/shared/auth/dashboard-access';
import { getSession } from '@/shared/auth/session';

export default async function HomePage() {
  const session = await getSession();
  const destination = getDefaultDashboardPath(session);
  redirect(destination);
}
