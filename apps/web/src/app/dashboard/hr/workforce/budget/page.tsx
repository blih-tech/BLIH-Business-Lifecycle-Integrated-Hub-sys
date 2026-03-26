import { WorkforceBudgetContent } from '@/features/hr/workforce/budget';
import { isAuthorizedForDashboard } from '@/shared/auth/role-routing';
import { getSession } from '@/shared/auth/session';
import { redirect } from 'next/navigation';

const DEMO_MODE = process.env.DEMO_MODE === 'true';

export default async function WorkforceBudgetPage() {
  if (!DEMO_MODE) {
    const session = await getSession();
    if (!session.authenticated) {
      redirect('/dashboard/hr');
    }
    if (!isAuthorizedForDashboard('hr', session.roles)) {
      redirect('/dashboard');
    }
  }

  return <WorkforceBudgetContent />;
}
