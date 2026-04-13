'use client';

import { useEffect, useState } from 'react';
import {
  OnboardingCard,
  ProgressStatCard,
} from '@/features/hr/onboarding/progress/components';
import { getEmployeeFull, getOnboardingRecords } from './api/progress.api';
import { mapTasksToMembers } from './utils/mapProgress';
import type { OnboardingMember } from './types';

function computeStats(members: OnboardingMember[]) {
  let inProgress = 0;
  let completed = 0;
  const overdue = 0;

  members.forEach((m) => {
    if (m.completionPercent === 100) completed++;
    else if (m.completionPercent > 0) inProgress++;
  });

  return [
    { id: 'in-progress', label: 'In Progress', value: String(inProgress) },
    { id: 'completed', label: 'Completed', value: String(completed) },
    { id: 'overdue', label: 'Overdue', value: String(overdue) },
  ];
}

export function OnboardingProgressContent() {
  const [members, setMembers] = useState<OnboardingMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const records = await getOnboardingRecords();
        const employeeEntries = await Promise.all(
          records.map(async (record) => {
            try {
              const employee = await getEmployeeFull(record.employeeId);
              return [record.employeeId, employee] as const;
            } catch {
              return [record.employeeId, null] as const;
            }
          }),
        );

        const employeeMap = employeeEntries.reduce<
          Record<string, Awaited<ReturnType<typeof getEmployeeFull>>>
        >((acc, [employeeId, employee]) => {
          if (employee) {
            acc[employeeId] = employee;
          }
          return acc;
        }, {});

        const mapped = mapTasksToMembers(records, employeeMap);
        setMembers(mapped);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const stats = computeStats(members);

  if (loading) return <p>Loading...</p>;

  return (
    <main className="mx-auto w-full max-w-[1024px] space-y-5 px-4 py-4">
      {/* ✅ STATS */}
      <section className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <ProgressStatCard key={stat.id} stat={stat} />
        ))}
      </section>

      {/* ✅ MEMBERS */}
      <section className="space-y-3">
        {members.map((member) => (
          <OnboardingCard key={member.id} member={member} />
        ))}
      </section>
    </main>
  );
}
