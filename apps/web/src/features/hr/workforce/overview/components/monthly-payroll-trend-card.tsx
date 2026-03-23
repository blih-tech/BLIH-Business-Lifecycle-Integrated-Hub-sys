'use client';

import { CartesianGrid, Dot, Line, LineChart, XAxis, YAxis } from 'recharts';

import type { MonthlyPayrollPoint } from '@/features/hr/workforce/overview/types';
import { ChartContainer } from '@/shared/components/ui/chart';
import { Card, CardContent } from '@/shared/components/ui/card';

type MonthlyPayrollTrendCardProps = {
  data: MonthlyPayrollPoint[];
};

const chartConfig = {
  amount: { label: 'Payroll', color: 'var(--primary)' },
};

export function MonthlyPayrollTrendCard({
  data,
}: MonthlyPayrollTrendCardProps) {
  return (
    <Card className="gap-0 rounded-[12px] border-border py-0 shadow-none">
      <CardContent className="space-y-3 p-4">
        <p className="text-sm leading-4 tracking-[-0.3125px] text-black">
          Monthly Payroll Trend
        </p>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <LineChart
            data={data}
            margin={{ left: 8, right: 8, top: 6, bottom: 0 }}
          >
            <CartesianGrid
              stroke="#e5e7eb"
              strokeDasharray="3 3"
              vertical={true}
            />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="text-xs text-[#666]"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={6}
              ticks={[0, 150000, 300000, 450000, 600000]}
              className="text-xs text-[#666]"
            />
            <Line
              type="linear"
              dataKey="amount"
              stroke="var(--color-amount)"
              strokeWidth={2}
              dot={
                <Dot r={2.7} fill="var(--primary)" stroke="var(--primary)" />
              }
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
