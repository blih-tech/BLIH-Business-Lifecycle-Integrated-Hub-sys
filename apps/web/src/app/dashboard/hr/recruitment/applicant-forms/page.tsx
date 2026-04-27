import { RecruitmentApplicantFormsContent } from '@/features/hr/recruitment/applicant-forms';
import { isAuthorizedForDashboard } from '@/shared/auth/role-routing';
import { getSession } from '@/shared/auth/session';
import { redirect } from 'next/navigation';

const DEMO_MODE = process.env.DEMO_MODE === 'true';

export default async function RecruitmentApplicantFormsPage() {
  if (!DEMO_MODE) {
    const session = await getSession();
    if (!session.authenticated) {
      redirect('/api/auth/login');
    }
    if (!isAuthorizedForDashboard('hr', session.roles)) {
      redirect('/dashboard');
    }
  }

  return <RecruitmentApplicantFormsContent />;
}
