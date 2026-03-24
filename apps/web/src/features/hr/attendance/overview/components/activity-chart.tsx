'use client';

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';

import type { ActivityPoint } from '@/features/hr/attendance/overview/types';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/shared/components/ui/chart';
import { Card, CardContent } from '@/shared/components/ui/card';

type ActivityChartProps = {
  data: ActivityPoint[];
};

const chartConfig = {
  value: { label: 'Presence', color: 'var(--primary)' },
};

export function ActivityChart({ data }: ActivityChartProps) {
  return (
    <Card className="gap-0 rounded-[10px] border-border py-0 shadow-none">
      <CardContent className="p-4 md:p-6">
        <p className="text-sm tracking-[-0.3125px] text-black">
          Activity and Presence
        </p>
        <ChartContainer
          config={chartConfig}
          className="mt-3 h-[140px] w-full md:h-[193px]"
        >
          <LineChart
            accessibilityLayer
            data={data}
            margin={{ left: 2, right: 10, top: 8, bottom: 0 }}
          >
            <CartesianGrid
              stroke="#d1d5db"
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
              domain={[0, 180]}
              ticks={[0, 45, 90, 135, 180]}
              className="text-xs text-[#666]"
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="var(--color-value)"
              strokeWidth={2}
              dot={{ r: 3, fill: 'var(--primary)' }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
