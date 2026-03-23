'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import type { DepartmentPerformance } from '@/features/hr/performance/overview/types';
import { ChartContainer } from '@/shared/components/ui/chart';
import { Card, CardContent } from '@/shared/components/ui/card';

type DepartmentPerformanceOverviewCardProps = {
  data: DepartmentPerformance[];
};

const chartConfig = {
  score: { label: 'Score', color: 'var(--primary)' },
};

export function DepartmentPerformanceOverviewCard({
  data,
}: DepartmentPerformanceOverviewCardProps) {
  return (
    <Card className="gap-0 rounded-[10px] border-border py-0 shadow-none">
      <CardContent className="p-3 md:p-4">
        <p className="text-[10px] text-black">
          Department Performance Overview
        </p>
        <ChartContainer config={chartConfig} className="mt-3 h-[190px] w-full">
          <BarChart
            data={data}
            margin={{ left: 2, right: 10, top: 8, bottom: 0 }}
          >
            <CartesianGrid
              stroke="#d1d5db"
              strokeDasharray="3 3"
              vertical={true}
            />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="text-[10px] text-[#666]"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              domain={[0, 5]}
              ticks={[0, 2, 4, 5]}
              className="text-[10px] text-[#666]"
            />
            <Bar
              dataKey="score"
              fill="var(--color-score)"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ChartContainer>

        <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-3">
          {data.map((item) => (
            <div key={item.id} className="rounded-[6px] bg-[#f3f3f3] p-2">
              <p className="text-[10px] font-medium text-black">{item.name}</p>
              <div className="mt-1 flex items-center justify-between">
                <p className="text-[9px] text-[#666]">
                  {item.employees} employees
                </p>
                <p className="text-[11px] font-semibold text-primary">
                  {item.score.toFixed(1)}/5.0
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
