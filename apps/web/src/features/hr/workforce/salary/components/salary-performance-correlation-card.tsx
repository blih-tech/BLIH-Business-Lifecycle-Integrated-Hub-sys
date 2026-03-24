'use client';

import { CartesianGrid, Scatter, ScatterChart, XAxis, YAxis } from 'recharts';

import type { SalaryPerformancePoint } from '@/features/hr/workforce/salary/types';
import { ChartContainer } from '@/shared/components/ui/chart';
import { Card, CardContent } from '@/shared/components/ui/card';

type SalaryPerformanceCorrelationCardProps = {
  data: SalaryPerformancePoint[];
};

const chartConfig = {
  score: { label: 'Performance', color: 'var(--primary)' },
};

export function SalaryPerformanceCorrelationCard({
  data,
}: SalaryPerformanceCorrelationCardProps) {
  return (
    <Card className="gap-0 rounded-[12px] border-border py-0 shadow-none">
      <CardContent className="space-y-3 p-4">
        <p className="text-sm tracking-[-0.3125px] text-black">
          Salary vs Performance Correlation
        </p>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ScatterChart margin={{ left: 10, right: 10, top: 8, bottom: 16 }}>
            <CartesianGrid stroke="#d5d7de" strokeDasharray="3 3" />
            <XAxis
              dataKey="salary"
              type="number"
              ticks={[0, 30000, 60000, 90000, 120000]}
              tickFormatter={(v) => `$${Math.round(v / 1000)}k`}
              className="text-xs text-[#666]"
              tickLine={false}
              axisLine={false}
              label={{
                value: 'Salary ($)',
                position: 'insideBottom',
                dy: 16,
                fill: '#808080',
                fontSize: 12,
              }}
            />
            <YAxis
              dataKey="score"
              type="number"
              domain={[3, 5]}
              ticks={[3, 3.5, 4, 4.5, 5]}
              className="text-xs text-[#666]"
              tickLine={false}
              axisLine={false}
              label={{
                value: 'Performance Score',
                angle: -90,
                position: 'insideLeft',
                fill: '#808080',
                fontSize: 12,
              }}
            />
            <Scatter data={data} fill="var(--primary)" />
          </ScatterChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
