import { OngoingRecruitmentContent } from '@/features/hr/recruitment/ongoing-recruitment';
import { isAuthorizedForDashboard } from '@/shared/auth/role-routing';
import { getSession } from '@/shared/auth/session';
import { redirect } from 'next/navigation';

const DEMO_MODE = process.env.DEMO_MODE === 'true';

export default async function OngoingRecruitmentPage() {
  const session = !DEMO_MODE ? await getSession() : null;

  if (!DEMO_MODE) {
    if (!session?.authenticated) {
      redirect('/api/auth/login');
    }
    if (!isAuthorizedForDashboard('hr', session?.roles ?? [])) {
      redirect('/dashboard');
    }
  }

  return (
    <OngoingRecruitmentContent currentUserName={session?.username ?? 'User'} />
  );
}
