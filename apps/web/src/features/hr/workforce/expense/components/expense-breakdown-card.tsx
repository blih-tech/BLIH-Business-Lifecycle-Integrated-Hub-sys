'use client';

import type { CSSProperties } from 'react';
import { Cell, Pie, PieChart, Tooltip } from 'recharts';

import type { ExpenseBreakdownItem } from '@/features/hr/workforce/expense/types';
import { ChartContainer } from '@/shared/components/ui/chart';
import { Card, CardContent } from '@/shared/components/ui/card';

type ExpenseBreakdownCardProps = {
  data: ExpenseBreakdownItem[];
};

const chartConfig = {
  breakdown: { label: 'Expense Breakdown', color: '#1e66f7' },
};

export function ExpenseBreakdownCard({ data }: ExpenseBreakdownCardProps) {
  return (
    <Card className="gap-0 rounded-[12px] border-border py-0 shadow-none">
      <CardContent className="space-y-3 p-4">
        <p className="text-sm font-medium tracking-[-0.176px] text-black">
          Expense Breakdown
        </p>
        <div className="relative h-[280px] w-full">
          <ChartContainer config={chartConfig} className="h-[280px] w-full">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius={0}
                outerRadius={92}
                stroke="#ffffff"
                strokeWidth={2}
              >
                {data.map((entry) => (
                  <Cell key={entry.id} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip cursor={false} />
            </PieChart>
          </ChartContainer>
          <div className="pointer-events-none absolute inset-0">
            {data.map((item, index) => (
              <div
                key={item.id}
                className="absolute text-[11px] font-medium text-right"
                style={labelPositions[index]}
              >
                <span style={{ color: item.color }}>
                  {index} {item.percent}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const labelPositions: Array<CSSProperties> = [
  { top: 8, left: '38%' },
  { bottom: 20, left: '36%' },
  { bottom: 10, left: '58%' },
  { bottom: 44, left: '69%' },
  { top: '55%', left: '75%' },
  { top: '45%', left: '78%' },
];
