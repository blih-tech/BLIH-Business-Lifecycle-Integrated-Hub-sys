import { RecruitmentRequestsContent } from '@/features/hr/recruitment/requests';
import { isAuthorizedForDashboard } from '@/shared/auth/role-routing';
import { getSession } from '@/shared/auth/session';
import { redirect } from 'next/navigation';

export default async function RecruitmentRequestsPage() {
  const session = await getSession();
  if (!session.authenticated) {
    redirect('/auth/signin');
  }

  if (!isAuthorizedForDashboard('hr', session.roles)) {
    redirect('/dashboard');
  }

  return (
    <RecruitmentRequestsContent currentUserName={session.username ?? 'User'} />
  );
}
