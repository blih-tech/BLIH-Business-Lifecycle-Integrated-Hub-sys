'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import type { MonthlyExpensePoint } from '@/features/hr/workforce/expense/types';
import { ChartContainer } from '@/shared/components/ui/chart';
import { Card, CardContent } from '@/shared/components/ui/card';

type MonthlyExpenseTrendCardProps = {
  data: MonthlyExpensePoint[];
};

const chartConfig = {
  amount: { label: 'Amount', color: '#1e66f7' },
};

export function MonthlyExpenseTrendCard({
  data,
}: MonthlyExpenseTrendCardProps) {
  return (
    <Card className="gap-0 rounded-[12px] border-border py-0 shadow-none">
      <CardContent className="space-y-3 p-4">
        <p className="text-sm font-medium tracking-[-0.176px] text-black">
          Monthly Expense Trend
        </p>
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
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
              ticks={[0, 200, 400, 600, 800]}
              className="text-xs text-[#666]"
              tickFormatter={(value) => `$${value}k`}
            />
            <Bar
              dataKey="amount"
              fill="var(--color-amount)"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
