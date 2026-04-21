import { getDashboardPath } from '@/shared/auth/role-routing';
import { getSession } from '@/shared/auth/session';
import { redirect } from 'next/navigation';

const DEMO_MODE = process.env.DEMO_MODE === 'true';

export default async function DashboardIndexPage() {
  if (DEMO_MODE) {
    redirect('/dashboard/hr');
  }

  const session = await getSession();
  console.log('[Dashboard] Session:', JSON.stringify(session));

  const dashboardPath = getDashboardPath(session.roles);
  if (dashboardPath) {
    redirect(dashboardPath);
  }

  redirect('/no-access');
}
