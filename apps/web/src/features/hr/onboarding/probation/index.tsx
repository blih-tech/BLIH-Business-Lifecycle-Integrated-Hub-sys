'use client';

import Link from 'next/link';

import { ProbationCard } from '@/features/hr/onboarding/probation/components';
import { useProbationEmployees } from '@/features/hr/onboarding/probation/hooks/use-probation';
import { Button } from '@/shared/components/ui/button';

export function OnboardingProbationContent() {
  const {
    data: employees = [],
    isLoading,
    isError,
    refetch,
  } = useProbationEmployees();

  if (isLoading) return <p>Loading probation plans...</p>;
  if (isError) {
    return (
      <main className="mx-auto w-full max-w-[1024px] space-y-4 px-4 py-4 md:px-5 md:py-5">
        <p className="text-sm text-destructive">
          Failed to load probation data. Please retry.
        </p>
        <Button type="button" variant="outline" onClick={() => void refetch()}>
          Retry
        </Button>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[1024px] space-y-5 px-4 py-4 md:px-5 md:py-5">
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Performance and Probation</h2>
        <Button asChild size="sm">
          <Link href="/dashboard/hr/onboarding/probation/create">
            Create Probation
          </Link>
        </Button>

        <div className="mt-4 space-y-3">
          {employees.map((employee, index) => (
            <ProbationCard
              key={employee.id}
              employee={employee}
              defaultExpanded={index === 0}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
