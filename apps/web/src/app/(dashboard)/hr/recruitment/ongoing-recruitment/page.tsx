import { OngoingRecruitmentContent } from '@/features/hr/recruitment/ongoing-recruitment';
import { getSession } from '@/shared/auth/session';

export default async function OngoingRecruitmentPage() {
  const session = await getSession();

  return (
    <OngoingRecruitmentContent currentUserName={session.username ?? 'User'} />
  );
}
