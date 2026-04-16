'use client';

import {
  ChecklistStatCard,
  JobApplicationFrequencyCard,
  SummaryStatCard,
  WorkHoursStatCard,
} from '@/features/hr/onboarding/overview/components';

import { useEffect, useState } from 'react';
import { getOverviewStats } from './api/overview.api';
import { mapOverview } from './overview.mapper';

export function OnboardingOverviewContent() {
  const [data, setData] = useState<ReturnType<typeof mapOverview> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await getOverviewStats();
        const mapped = mapOverview(res);
        setData(mapped);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!data) return <p>No data</p>;

  return (
    <main className="mx-auto w-full max-w-[1024px] space-y-5 px-4 py-4 md:px-5 md:py-5">
      {/* Summary */}
      <section className="grid gap-4 md:grid-cols-3">
        {data.summary.map((stat) => (
          <SummaryStatCard key={stat.id} stat={stat} />
        ))}
      </section>

      {/* Work hours */}
      <section className="rounded-[12px] border border-[#e5e5e5] bg-white p-4">
        <p className="text-sm text-black">Work Hours Performance</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {data.workHours.map((stat) => (
            <WorkHoursStatCard key={stat.id} stat={stat} />
          ))}
        </div>
      </section>

      {/* Chart */}
      <JobApplicationFrequencyCard data={data.jobFrequency} />

      {/* Checklist stats */}
      <section className="grid gap-4 md:grid-cols-3">
        {data.checklist.map((stat) => (
          <ChecklistStatCard key={stat.id} stat={stat} />
        ))}
      </section>
    </main>
  );
}
