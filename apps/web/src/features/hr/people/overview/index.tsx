'use client';

import { useMemo } from 'react';

import {
  ChecklistStatCard,
  JobApplicationFrequencyCard,
  SummaryStatCard,
  WorkHoursStatCard,
} from '@/features/hr/onboarding/overview/components';
import { useEmployeeList } from '@/hooks/hr/use-employees';
import {
  peopleChecklistStats,
  peopleJobApplicationFrequency,
  peopleWorkHoursStats,
} from '@/features/hr/people/overview/mock-data';
import type { PeopleSummaryStat } from '@/features/hr/people/overview/types';

export function PeopleOverviewContent() {
  const { data: employees = [], isLoading } = useEmployeeList();

  const summaryStats = useMemo<PeopleSummaryStat[]>(() => {
    const onboarding = employees.filter(
      (e) => e.lifecycleStatus === 'ONBOARDING',
    ).length;
    const active = employees.filter(
      (e) => e.lifecycleStatus === 'ACTIVE',
    ).length;
    const total = employees.filter(
      (e) =>
        e.lifecycleStatus !== 'TERMINATED' &&
        e.lifecycleStatus !== 'RESIGNED' &&
        e.lifecycleStatus !== 'RETIRED',
    ).length;

    return [
      {
        id: 'active-onboarding',
        label: 'Active Onboarding',
        value: isLoading ? '…' : String(onboarding),
        icon: 'users',
      },
      {
        id: 'total-active',
        label: 'Total Active',
        value: isLoading ? '…' : String(active),
        icon: 'check-circle',
      },
      {
        id: 'total-employees',
        label: 'Total Employees',
        value: isLoading ? '…' : String(total),
        icon: 'clock-3',
      },
    ];
  }, [employees, isLoading]);

  return (
    <main className="mx-auto w-full max-w-[1024px] space-y-5 px-4 py-4 md:px-5 md:py-5">
      <section className="grid gap-4 md:grid-cols-3">
        {summaryStats.map((stat) => (
          <SummaryStatCard key={stat.id} stat={stat} />
        ))}
      </section>

      <section className="rounded-[12px] border border-[#e5e5e5] bg-white p-4">
        <p className="text-sm text-black">Work Hours Performance</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {peopleWorkHoursStats.map((stat) => (
            <WorkHoursStatCard key={stat.id} stat={stat} />
          ))}
        </div>
      </section>

      <JobApplicationFrequencyCard data={peopleJobApplicationFrequency} />

      <section className="grid gap-4 md:grid-cols-3">
        {peopleChecklistStats.map((stat) => (
          <ChecklistStatCard key={stat.id} stat={stat} />
        ))}
      </section>
    </main>
  );
}
