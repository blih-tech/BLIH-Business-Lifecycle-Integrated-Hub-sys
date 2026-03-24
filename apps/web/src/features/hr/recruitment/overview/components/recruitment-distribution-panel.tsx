'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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

type RecruitmentDistributionPanelProps = {
  salaryDistribution: ActiveJobItem['salaryDistribution'];
  genderDistribution: ActiveJobItem['genderDistribution'];
  experienceDistribution: ActiveJobItem['experienceDistribution'];
};

const salaryConfig = {
  value: { label: 'Applicants', color: '#2e68e6' },
};

const experienceConfig = {
  value: { label: 'Applicants', color: '#2e68e6' },
};

const genderConfig = {
  male: { label: 'Male', color: '#1e66f7' },
  female: { label: 'Female', color: '#a0bfff' },
};

export function RecruitmentDistributionPanel({
  salaryDistribution,
  genderDistribution,
  experienceDistribution,
}: RecruitmentDistributionPanelProps) {
  return (
    <section className="grid gap-4 lg:grid-cols-[1.3fr_0.75fr_1fr]">
      <article className="min-w-0 overflow-hidden rounded-[12px] border border-border p-4">
        <p className="text-sm tracking-[-0.2px] text-black">
          Salary Expectations
        </p>
        <ChartContainer
          config={salaryConfig}
          className="mt-4 h-[180px] w-full min-w-0"
        >
          <BarChart data={salaryDistribution}>
            <CartesianGrid strokeDasharray="3 3" vertical />
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
              {salaryDistribution.map((item) => (
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
        <p className="text-sm tracking-[-0.2px] text-black">
          Gender Distribution
        </p>
        <ChartContainer
          config={genderConfig}
          className="mt-4 h-[150px] w-full min-w-0"
        >
          <PieChart>
            <Pie
              data={genderDistribution}
              dataKey="value"
              nameKey="name"
              innerRadius={0}
              outerRadius={56}
              paddingAngle={0}
            >
              {genderDistribution.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
            </Pie>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
          </PieChart>
        </ChartContainer>
        <div className="mt-2 flex items-center justify-center gap-5">
          {genderDistribution.map((item) => (
            <div
              key={item.name}
              className="flex items-center gap-1.5 text-xs text-black"
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: item.fill }}
              />
              {item.name}: {item.value}
            </div>
          ))}
        </div>
      </article>

      <article className="min-w-0 overflow-hidden rounded-[12px] border border-border p-4">
        <p className="text-sm tracking-[-0.2px] text-black">
          Experience Distribution
        </p>
        <ChartContainer
          config={experienceConfig}
          className="mt-4 h-[180px] w-full min-w-0"
        >
          <BarChart data={experienceDistribution}>
            <CartesianGrid strokeDasharray="3 3" vertical />
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
              {experienceDistribution.map((item) => (
                <Cell key={item.range} fill={item.fill} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </article>
    </section>
  );
}
