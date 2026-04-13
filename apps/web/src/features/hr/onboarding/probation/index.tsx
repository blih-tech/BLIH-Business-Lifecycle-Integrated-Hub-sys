'use client';

import { useEffect, useState } from 'react';

import { ProbationCard } from '@/features/hr/onboarding/probation/components';
/* import { ProgressStatCard } from "@/features/hr/onboarding/progress/components"; */

import {
  getEmployeeFull,
  getFinalEvaluation,
  getProbations,
  type ProbationPlan,
} from './api/probation.api';
import type { ProbationEmployee } from './types';
import { mapProbationToEmployee } from './utils/mapProbation';

export function OnboardingProbationContent() {
  const [employees, setEmployees] = useState<ProbationEmployee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const plans = await getProbations();

        const mapped = await Promise.all(
          plans.map(async (plan: ProbationPlan) => {
            const employee = await getEmployeeFull(plan.employeeId).catch(
              () => null,
            );
            const evaluation = await getFinalEvaluation(plan.id);
            return mapProbationToEmployee(plan, evaluation, employee);
          }),
        );

        setEmployees(mapped);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <main className="mx-auto w-full max-w-[1024px] space-y-5 px-4 py-4 md:px-5 md:py-5">
      <section>
        <h2 className="text-xl font-semibold">Performance and Probation</h2>

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
