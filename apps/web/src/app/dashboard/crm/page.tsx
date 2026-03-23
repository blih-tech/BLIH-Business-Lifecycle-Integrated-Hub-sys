import { isAuthorizedForDashboard } from '@/shared/auth/role-routing';
import { getSession } from '@/shared/auth/session';
import { redirect } from 'next/navigation';

export default async function CrmDashboardPage() {
  const session = await getSession();
  if (!session.authenticated) {
    redirect('/auth/signin');
  }

  if (!isAuthorizedForDashboard('crm', session.roles)) {
    redirect('/dashboard');
  }

  return (
    <main className="mx-auto w-full max-w-6xl space-y-4 p-6 md:p-10">
      <h1 className="text-2xl font-semibold tracking-tight">CRM Dashboard</h1>
      <p className="text-sm text-muted-foreground">
        Customer pipeline, retention, and engagement performance.
      </p>
    </main>
  );
}
