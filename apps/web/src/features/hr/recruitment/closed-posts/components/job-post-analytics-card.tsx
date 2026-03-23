'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from 'recharts';

import type { ActiveJobItem } from '@/features/hr/recruitment/active-posting/types';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/shared/components/ui/chart';

type JobPostAnalyticsCardProps = {
  job: ActiveJobItem;
};

const lineConfig = {
  applications: { label: 'Applications', color: '#2e68e6' },
};

const salaryConfig = {
  value: { label: 'Applicants', color: '#2e68e6' },
};

const experienceConfig = {
  value: { label: 'Applicants', color: '#2e68e6' },
};

export function JobPostAnalyticsCard({ job }: JobPostAnalyticsCardProps) {
  return (
    <article className="rounded-[12px] border border-[#e5e5e5] bg-white p-6">
      <h3 className="text-base font-medium tracking-[-0.3125px] text-black">
        {job.title} Post Analytics
      </h3>

      <div className="mt-6 space-y-4">
        <article className="rounded-[12px] border border-border p-4">
          <p className="text-sm text-black">Job Post Frequency</p>
          <ChartContainer config={lineConfig} className="mt-4 h-[220px] w-full">
            <LineChart
              accessibilityLayer
              data={job.applicationFrequency}
              margin={{ left: 8, right: 8, top: 8, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={true} />
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
        </article>

        <div className="grid gap-4 lg:grid-cols-[1.25fr_0.8fr_1.25fr]">
          <article className="min-w-0 overflow-hidden rounded-[12px] border border-border p-4">
            <p className="text-sm text-black">Salary Expectations</p>
            <ChartContainer
              config={salaryConfig}
              className="mt-4 h-[180px] w-full min-w-0"
            >
              <BarChart data={job.salaryDistribution}>
                <CartesianGrid strokeDasharray="3 3" vertical={true} />
                <XAxis
                  dataKey="range"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={6}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 60]}
                  ticks={[0, 15, 30, 45, 60]}
                />
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Bar dataKey="value" radius={0}>
                  {job.salaryDistribution.map((item) => (
                    <Cell
                      key={item.range}
                      fill={
                        item.range === '<10K'
                          ? '#95afe3'
                          : item.range === '10-15K'
                            ? '#2e68e6'
                            : item.range === '15-20K'
                              ? '#a9e638'
                              : '#f0d43a'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </article>

          <article className="min-w-0 overflow-hidden rounded-[12px] border border-border p-4">
            <p className="text-sm text-black">Gender Distribution</p>
            <ChartContainer
              config={{
                male: { label: 'Male', color: '#1e66f7' },
                female: { label: 'Female', color: '#a0bfff' },
              }}
              className="mt-4 h-[150px] w-full min-w-0"
            >
              <PieChart>
                <Pie
                  data={job.genderDistribution}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={0}
                  outerRadius={56}
                  paddingAngle={0}
                >
                  {job.genderDistribution.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              </PieChart>
            </ChartContainer>
            <div className="mt-2 flex items-center justify-center gap-5">
              {job.genderDistribution.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center gap-1.5 text-xs text-black"
                >
                  <span
                    className="h-2.5 w-2.5"
                    style={{ backgroundColor: item.fill }}
                  />
                  {item.name}: {item.value}
                </div>
              ))}
            </div>
          </article>

          <article className="min-w-0 overflow-hidden rounded-[12px] border border-border p-4">
            <p className="text-sm text-black">Experience Distribution</p>
            <ChartContainer
              config={experienceConfig}
              className="mt-4 h-[180px] w-full min-w-0"
            >
              <BarChart data={job.experienceDistribution}>
                <CartesianGrid strokeDasharray="3 3" vertical={true} />
                <XAxis
                  dataKey="range"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={6}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 60]}
                  ticks={[0, 15, 30, 45, 60]}
                />
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Bar dataKey="value" radius={0}>
                  {job.experienceDistribution.map((item) => (
                    <Cell key={item.range} fill={item.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </article>
        </div>
      </div>
    </article>
  );
}
