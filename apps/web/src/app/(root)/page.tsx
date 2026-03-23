import { getDashboardPath } from '@/shared/auth/role-routing';
import { getSession } from '@/shared/auth/session';
import { redirect } from 'next/navigation';

export default async function Home() {
  const session = await getSession();
  if (!session.authenticated) {
    redirect('/auth/signin');
  }

  const dashboardPath = getDashboardPath(session.roles);
  redirect(dashboardPath ?? '/no-access');
}
