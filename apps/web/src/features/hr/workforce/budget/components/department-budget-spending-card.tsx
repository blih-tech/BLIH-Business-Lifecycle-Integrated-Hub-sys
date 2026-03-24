'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import type { DepartmentBudgetPoint } from '@/features/hr/workforce/budget/types';
import { ChartContainer } from '@/shared/components/ui/chart';
import { Card, CardContent } from '@/shared/components/ui/card';

type DepartmentBudgetSpendingCardProps = {
  data: DepartmentBudgetPoint[];
};

const chartConfig = {
  allocated: { label: 'Allocated', color: '#9ec5ff' },
  spent: { label: 'Spent', color: '#1e66f7' },
};

export function DepartmentBudgetSpendingCard({
  data,
}: DepartmentBudgetSpendingCardProps) {
  return (
    <Card className="gap-0 rounded-[12px] border-border py-0 shadow-none">
      <CardContent className="space-y-3 p-4">
        <p className="text-sm font-medium tracking-[-0.176px] text-black">
          Department Budget vs Actual Spending
        </p>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart
            data={data}
            margin={{ left: 4, right: 8, top: 6, bottom: 0 }}
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
              ticks={[0, 250, 500, 750, 1000]}
              className="text-xs text-[#666]"
              tickFormatter={(value) => `$${value}k`}
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
