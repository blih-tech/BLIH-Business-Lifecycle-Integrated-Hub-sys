"use client";

import { Bar, BarChart, XAxis, YAxis } from "recharts";

import { ChartContainer } from "@/shared/components/ui/chart";

type KpiTrendBarsProps = {
  values: number[];
};

const chartConfig = {
  value: { label: "Trend", color: "var(--primary)" },
};

export function KpiTrendBars({ values }: KpiTrendBarsProps) {
  const data = values.map((value, index) => ({ month: `M${index + 1}`, value }));

  return (
    <ChartContainer config={chartConfig} className="h-[64px] w-full">
      <BarChart data={data} margin={{ left: 0, right: 0, top: 0, bottom: 0 }} barCategoryGap={4}>
        <XAxis dataKey="month" hide />
        <YAxis hide domain={[0, 70]} />
        <Bar dataKey="value" fill="var(--color-value)" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
