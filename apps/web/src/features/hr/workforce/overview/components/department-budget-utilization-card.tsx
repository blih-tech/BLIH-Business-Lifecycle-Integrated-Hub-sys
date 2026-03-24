'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import type { DepartmentBudgetPoint } from '@/features/hr/workforce/overview/types';
import { ChartContainer } from '@/shared/components/ui/chart';
import { Card, CardContent } from '@/shared/components/ui/card';

type DepartmentBudgetUtilizationCardProps = {
  data: DepartmentBudgetPoint[];
};

const chartConfig = {
  allocated: { label: 'Allocated', color: '#5f94ff' },
  spent: { label: 'Spent', color: '#1e66f7' },
};

export function DepartmentBudgetUtilizationCard({
  data,
}: DepartmentBudgetUtilizationCardProps) {
  return (
    <Card className="gap-0 rounded-[12px] border-border py-0 shadow-none">
      <CardContent className="space-y-3 p-4">
        <p className="text-sm leading-4 tracking-[-0.3125px] text-black">
          Department Budget Utilization
        </p>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <BarChart
            data={data}
            margin={{ left: 8, right: 8, top: 6, bottom: 0 }}
            barCategoryGap={12}
          >
            <CartesianGrid
              stroke="#e5e7eb"
              strokeDasharray="3 3"
              vertical={true}
            />
            <XAxis
              dataKey="department"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="text-xs text-[#666]"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={6}
              ticks={[0, 250000, 500000, 750000, 1000000]}
              className="text-xs text-[#666]"
            />
            <Bar
              dataKey="allocated"
              fill="var(--color-allocated)"
              radius={[2, 2, 0, 0]}
            />
            <Bar
              dataKey="spent"
              fill="var(--color-spent)"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
