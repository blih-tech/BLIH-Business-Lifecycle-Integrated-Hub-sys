'use client';

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';

import type { ResignationTrendPoint } from '@/features/hr/exit/overview/types';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/shared/components/ui/chart';
import { Card, CardContent } from '@/shared/components/ui/card';

type ResignationTrendsCardProps = {
  data: ResignationTrendPoint[];
};

const chartConfig = {
  exits: { label: 'Exits', color: 'var(--primary)' },
  hires: { label: 'Hires', color: '#4a5565' },
};

export function ResignationTrendsCard({ data }: ResignationTrendsCardProps) {
  return (
    <Card className="gap-0 rounded-[10px] border-border py-0 shadow-none">
      <CardContent className="space-y-3 p-4">
        <p className="text-base font-medium tracking-[-0.176px] text-black">
          Resignation Trends
        </p>
        <ChartContainer config={chartConfig} className="h-[260px] w-full">
          <LineChart
            accessibilityLayer
            data={data}
            margin={{ left: 2, right: 10, top: 8, bottom: 0 }}
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
              tickMargin={8}
              ticks={[0, 3, 6, 9, 12]}
              className="text-xs text-[#666]"
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              type="monotone"
              dataKey="exits"
              stroke="var(--color-exits)"
              strokeWidth={2}
              dot={{ r: 3, fill: 'var(--primary)' }}
            />
            <Line
              type="monotone"
              dataKey="hires"
              stroke="var(--color-hires)"
              strokeWidth={2}
              dot={{ r: 3, fill: '#4a5565' }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
