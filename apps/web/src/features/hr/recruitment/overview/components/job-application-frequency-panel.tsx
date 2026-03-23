'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from 'recharts';

import type {
  DailyAreaPoint,
  MonthlyFrequencyPoint,
} from '@/features/hr/recruitment/overview/types';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/shared/components/ui/chart';

type JobApplicationFrequencyPanelProps = {
  monthlyData: MonthlyFrequencyPoint[];
  dailyData: DailyAreaPoint[];
};

const monthlyConfig = {
  count: { label: 'Applications', color: '#2e68e6' },
};

const areaConfig = {
  upper: { label: 'Upper', color: '#2e68e6' },
  lower: { label: 'Lower', color: '#2e68e6' },
};

export function JobApplicationFrequencyPanel({
  monthlyData,
  dailyData,
}: JobApplicationFrequencyPanelProps) {
  return (
    <section className="rounded-[12px] border border-border bg-white p-6">
      <p className="text-sm tracking-[-0.3125px] text-black">
        Job Application Frequency
      </p>

      <ChartContainer config={monthlyConfig} className="mt-5 h-[250px] w-full">
        <LineChart
          accessibilityLayer
          data={monthlyData}
          margin={{ left: 8, right: 12, top: 10, bottom: 8 }}
        >
          <CartesianGrid stroke="#d4d4d8" strokeDasharray="3 3" vertical />
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
            dataKey="count"
            stroke="var(--color-count)"
            strokeWidth={2}
            dot={{ r: 3.5, fill: '#2e68e6' }}
          />
        </LineChart>
      </ChartContainer>

      <ChartContainer config={areaConfig} className="mt-6 h-[300px] w-full">
        <AreaChart
          accessibilityLayer
          data={dailyData}
          margin={{ left: 8, right: 12, top: 10, bottom: 8 }}
        >
          <defs>
            <linearGradient id="upperFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2e68e6" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#2e68e6" stopOpacity={0.08} />
            </linearGradient>
            <linearGradient id="lowerFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2e68e6" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#2e68e6" stopOpacity={0.04} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#d4d4d8" strokeDasharray="3 3" vertical />
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            domain={[0, 6000]}
            ticks={[0, 1500, 3000, 4500, 6000]}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Area
            type="monotone"
            dataKey="upper"
            stroke="#2e68e6"
            strokeWidth={2}
            fill="url(#upperFill)"
          />
          <Area
            type="monotone"
            dataKey="lower"
            stroke="#2e68e6"
            strokeWidth={2}
            fill="url(#lowerFill)"
          />
        </AreaChart>
      </ChartContainer>
    </section>
  );
}
