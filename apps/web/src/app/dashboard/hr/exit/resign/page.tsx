import { ExitResignContent } from '@/features/hr/exit/resign';
import { isAuthorizedForDashboard } from '@/shared/auth/role-routing';
import { getSession } from '@/shared/auth/session';
import { redirect } from 'next/navigation';

export default async function ExitResignPage() {
  const session = await getSession();
  if (!session.authenticated) {
    redirect('/auth/signin');
  }

  if (!isAuthorizedForDashboard('hr', session.roles)) {
    redirect('/dashboard');
  }

  return <ExitResignContent />;
}
