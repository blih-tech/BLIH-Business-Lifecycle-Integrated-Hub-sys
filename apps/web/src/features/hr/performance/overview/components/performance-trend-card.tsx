"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import type { TrendPoint } from "@/features/hr/performance/overview/types";
import { ChartContainer } from "@/shared/components/ui/chart";
import { Card, CardContent } from "@/shared/components/ui/card";

type PerformanceTrendCardProps = {
  data: TrendPoint[];
};

const chartConfig = {
  performance: { label: "Performance", color: "var(--primary)" },
  workHours: { label: "Work Hours", color: "#5D95E2" },
};

export function PerformanceTrendCard({ data }: PerformanceTrendCardProps) {
  return (
    <Card className="gap-0 rounded-[10px] border-border py-0 shadow-none">
      <CardContent className="p-3 md:p-4">
        <p className="text-[10px] text-black">Performance &amp; Work Hours Trend</p>
        <ChartContainer config={chartConfig} className="mt-3 h-[160px] w-full">
          <LineChart data={data} margin={{ left: 2, right: 10, top: 8, bottom: 0 }}>
            <CartesianGrid stroke="#d1d5db" strokeDasharray="3 3" vertical={true} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} className="text-[10px] text-[#666]" />
            <YAxis yAxisId="left" tickLine={false} axisLine={false} domain={[0, 5]} ticks={[0, 2, 4, 5]} className="text-[10px] text-[#666]" />
            <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} domain={[0, 50]} ticks={[0, 15, 30, 50]} className="text-[10px] text-[#666]" />
            <Line yAxisId="left" type="monotone" dataKey="performance" stroke="var(--color-performance)" strokeWidth={2} dot={{ r: 3, fill: "var(--primary)" }} />
            <Line yAxisId="right" type="monotone" dataKey="workHours" stroke="var(--color-workHours)" strokeWidth={2} dot={{ r: 3, fill: "#5D95E2" }} />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
