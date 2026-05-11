import Link from 'next/link';
import { Button } from '@/shared/components/ui/button';

export default function NoAccessPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <div className="mx-auto w-full max-w-md space-y-4 rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight">
          Access Required
        </h1>
        <p className="text-sm text-muted-foreground">
          Your account does not have a dashboard role assigned. Contact an
          administrator for access.
        </p>
        <div className="flex justify-center gap-3">
          <Button asChild>
            <Link href="/">Go to Dashboard</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/api/auth/logout?redirect=/">Sign Out</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
