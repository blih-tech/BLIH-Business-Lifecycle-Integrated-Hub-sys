'use client';

import { useMemo, useState } from 'react';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';

import type { ActiveJobItem } from '@/features/hr/recruitment/active-posting/types';
import { AnalyticsForJobs } from '@/features/hr/recruitment/closed-posts/components/analytics-for-jobs';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/shared/components/ui/chart';

import { FrequentlyPostedJobsCard } from './frequently-posted-jobs-card';
import { RecruitmentDistributionPanel } from './recruitment-distribution-panel';

const lineConfig = {
  applications: { label: 'Applications', color: '#2e68e6' },
};

type RecruitmentOverviewAnalyticsProps = {
  jobs: ActiveJobItem[];
};

export function RecruitmentOverviewAnalytics({
  jobs,
}: RecruitmentOverviewAnalyticsProps) {
  const [selectedJobId, setSelectedJobId] = useState(jobs[0]?.id ?? '');

  const selectedJob = useMemo(
    () => jobs.find((job) => job.id === selectedJobId) ?? jobs[0],
    [jobs, selectedJobId],
  );

  if (!selectedJob) {
    return null;
  }

  return (
    <section className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[1.6fr_0.7fr]">
        <FrequentlyPostedJobsCard />
        <AnalyticsForJobs
          jobs={jobs}
          selectedJobId={selectedJobId}
          onSelectJob={setSelectedJobId}
        />
      </div>

      <article className="rounded-[12px] border border-border bg-white p-6">
        <h3 className="text-base font-medium tracking-[-0.3125px] text-black">
          {selectedJob.title} Post Analytics
        </h3>

        <ChartContainer config={lineConfig} className="mt-5 h-[220px] w-full">
          <LineChart
            accessibilityLayer
            data={selectedJob.applicationFrequency}
            margin={{ left: 8, right: 8, top: 8, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              domain={[0, 180]}
              ticks={[0, 45, 90, 135, 180]}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              type="monotone"
              dataKey="applications"
              stroke="var(--color-applications)"
              strokeWidth={2}
              dot={{ r: 4, fill: '#2e68e6' }}
            />
          </LineChart>
        </ChartContainer>

        <div className="mt-6">
          <RecruitmentDistributionPanel
            salaryDistribution={selectedJob.salaryDistribution}
            genderDistribution={selectedJob.genderDistribution}
            experienceDistribution={selectedJob.experienceDistribution}
          />
        </div>
      </article>
    </section>
  );
}
