'use client';

import { Cell, Pie, PieChart } from 'recharts';

import type { DistributionSlice } from '@/features/hr/performance/overview/types';
import { ChartContainer } from '@/shared/components/ui/chart';
import { Card, CardContent } from '@/shared/components/ui/card';

type PerformanceDistributionCardProps = {
  data: DistributionSlice[];
};

const chartConfig = {
  value: { label: 'Performance' },
};

export function PerformanceDistributionCard({
  data,
}: PerformanceDistributionCardProps) {
  return (
    <Card className="gap-0 rounded-[10px] border-border py-0 shadow-none">
      <CardContent className="p-3 md:p-4">
        <p className="text-xs text-black">Performance Distribution</p>
        <ChartContainer config={chartConfig} className="mt-3 h-[180px] w-full">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="48%"
              innerRadius={0}
              outerRadius={72}
              paddingAngle={0}
            >
              {data.map((entry) => (
                <Cell key={entry.key} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>

        <div className="mt-2 space-y-1.5">
          {data.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between text-[10px]"
            >
              <div className="flex items-center gap-1.5 text-[#666]">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                {item.label}
              </div>
              <span className="font-medium text-black">{item.value}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
