'use client';

import { OngoingRecruitmentContent } from '@/features/hr/recruitment/ongoing-recruitment';
import { useSession } from '@/shared/auth/use-session';

export default function OngoingRecruitmentPage() {
  const session = useSession();

  return (
    <OngoingRecruitmentContent currentUserName={session.username ?? 'User'} />
  );
}
