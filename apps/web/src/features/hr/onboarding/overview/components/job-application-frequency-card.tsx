"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import type { JobFrequencyPoint } from "@/features/hr/onboarding/overview/types";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/shared/components/ui/chart";

type JobApplicationFrequencyCardProps = {
  data: JobFrequencyPoint[];
};

const chartConfig = {
  applications: { label: "Applications", color: "#2e68e6" },
};

export function JobApplicationFrequencyCard({ data }: JobApplicationFrequencyCardProps) {
  return (
    <article className="rounded-[12px] border border-[#e5e5e5] bg-white p-4">
      <p className="text-sm text-black">Job Application Frequency</p>
      <ChartContainer config={chartConfig} className="mt-4 h-[220px] w-full">
        <LineChart accessibilityLayer data={data} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={true} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis tickLine={false} axisLine={false} tickMargin={8} domain={[0, 180]} ticks={[0, 45, 90, 135, 180]} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line type="monotone" dataKey="applications" stroke="var(--color-applications)" strokeWidth={2} dot={{ r: 4, fill: "#2e68e6" }} />
        </LineChart>
      </ChartContainer>
    </article>
  );
}

