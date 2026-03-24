'use client';

import { Medal } from 'lucide-react';
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

type AnalyticsTabProps = {
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

export function AnalyticsTab({ job }: AnalyticsTabProps) {
  return (
    <section className="space-y-6 px-6">
      <div className="grid gap-4 lg:grid-cols-[364px_1fr]">
        <article className="rounded-[8px] border border-primary bg-[rgba(30,102,247,0.05)] p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 text-xs font-medium text-primary">
              <span className="inline-flex h-[17px] w-[17px] items-center justify-center rounded-full bg-primary text-white">
                <Medal className="h-2.5 w-2.5" />
              </span>
              Top Match
            </div>
            <span className="inline-flex items-center rounded-[4px] border border-primary px-[5px] py-[3px] text-[10px] font-bold text-primary">
              {job.topMatch.matchScore}%
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 pl-6">
            <div>
              <p className="text-base font-semibold tracking-[-0.3125px] text-black">
                {job.topMatch.fullName}
              </p>
              <p className="text-xs text-[#666]">{job.topMatch.phone}</p>
            </div>
            <div>
              <p className="text-xs text-[#666]">Experience</p>
              <p className="text-sm font-semibold tracking-[-0.1504px] text-black">
                {job.topMatch.experience}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#666]">Salary Expectation</p>
              <p className="text-sm font-semibold tracking-[-0.1504px] text-black">
                {job.topMatch.salaryExpectation}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#666]">Can Start</p>
              <p className="text-sm font-semibold tracking-[-0.1504px] text-black">
                {job.topMatch.canStart}
              </p>
            </div>
          </div>
        </article>

        <article className="grid grid-cols-4 rounded-[8px] bg-[#f3f3f3] p-3">
          {[
            {
              label: 'Total',
              value: job.pipelineStats.total,
              tone: 'text-black',
            },
            {
              label: 'Interviewed',
              value: job.pipelineStats.interviewed,
              tone: 'text-primary',
            },
            {
              label: 'Shortlist',
              value: job.pipelineStats.shortlist,
              tone: 'text-primary',
            },
            {
              label: 'Rejected',
              value: job.pipelineStats.rejected,
              tone: 'text-black',
            },
          ].map((item) => (
            <div
              key={item.label}
              className="flex flex-col items-center justify-center gap-2 py-4"
            >
              <p
                className={`text-[38px] font-semibold leading-7 tracking-[-0.4395px] ${item.tone}`}
              >
                {item.value}
              </p>
              <p className="text-xs text-[#666]">{item.label}</p>
            </div>
          ))}
        </article>
      </div>

      <article className="rounded-[12px] border border-border p-4">
        <p className="text-sm text-black">Job Application Frequency</p>
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
    </section>
  );
}
