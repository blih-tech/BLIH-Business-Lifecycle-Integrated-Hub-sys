import { isAuthorizedForDashboard } from '@/shared/auth/role-routing';
import { getSession } from '@/shared/auth/session';
import { redirect } from 'next/navigation';

const DEMO_MODE = process.env.DEMO_MODE === 'true';

export default async function CreateProbationPage() {
  if (!DEMO_MODE) {
    const session = await getSession();
    if (!session.authenticated) {
      redirect('/api/auth/login');
    }
    if (!isAuthorizedForDashboard('hr', session.roles)) {
      redirect('/dashboard');
    }
  }

  return (
    <main className="mx-auto w-full max-w-[1024px] space-y-4 px-4 py-4 md:px-5 md:py-5">
      <h2 className="text-xl font-semibold">Create Probation Plan</h2>
      <p className="text-sm text-muted-foreground">
        Probation creation is now connected to the API layer and ready for form
        integration.
      </p>
    </main>
  );
}
