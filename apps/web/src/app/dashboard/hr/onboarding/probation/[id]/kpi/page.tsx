import { KpiManagement } from '@/features/hr/onboarding/probation/components';
import { isAuthorizedForDashboard } from '@/shared/auth/role-routing';
import { getSession } from '@/shared/auth/session';
import { redirect } from 'next/navigation';

const DEMO_MODE = process.env.DEMO_MODE === 'true';

type ProbationKpiPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProbationKpiPage({
  params,
}: ProbationKpiPageProps) {
  if (!DEMO_MODE) {
    const session = await getSession();
    if (!session.authenticated) {
      redirect('/api/auth/login');
    }
    if (!isAuthorizedForDashboard('hr', session.roles)) {
      redirect('/dashboard');
    }
  }

  const { id } = await params;

  return (
    <main className="mx-auto w-full max-w-[1024px] space-y-6 px-4 py-4 md:px-5 md:py-5">
      <h2 className="text-xl font-semibold">Probation KPI Management</h2>
      <KpiManagement probationId={id} />
    </main>
  );
}
