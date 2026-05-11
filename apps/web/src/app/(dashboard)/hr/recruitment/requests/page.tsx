import { RecruitmentRequestsContent } from '@/features/hr/recruitment/requests';
import { getSession } from '@/shared/auth/session';

export default async function RecruitmentRequestsPage() {
  const session = await getSession();

  return (
    <RecruitmentRequestsContent currentUserName={session.username ?? 'User'} />
  );
}
