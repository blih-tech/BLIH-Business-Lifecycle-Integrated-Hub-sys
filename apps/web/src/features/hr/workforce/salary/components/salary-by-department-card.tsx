"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import type { DepartmentSalaryPoint, DepartmentSalarySummary } from "@/features/hr/workforce/salary/types";
import { ChartContainer } from "@/shared/components/ui/chart";
import { Card, CardContent } from "@/shared/components/ui/card";

type SalaryByDepartmentCardProps = {
  data: DepartmentSalaryPoint[];
  summaries: DepartmentSalarySummary[];
};

const chartConfig = {
  average: { label: "Average", color: "var(--primary)" },
};

export function SalaryByDepartmentCard({ data, summaries }: SalaryByDepartmentCardProps) {
  return (
    <Card className="gap-0 rounded-[12px] border-border py-0 shadow-none">
      <CardContent className="space-y-4 p-4">
        <p className="text-sm tracking-[-0.3125px] text-black">Salary by Department</p>
        <ChartContainer config={chartConfig} className="h-[142px] w-full">
          <BarChart data={data} margin={{ left: 10, right: 10, top: 8, bottom: 2 }}>
            <CartesianGrid stroke="#d5d7de" strokeDasharray="3 3" />
            <XAxis dataKey="department" tickLine={false} axisLine={false} className="text-xs text-[#666]" />
            <YAxis
              tickLine={false}
              axisLine={false}
              ticks={[0, 25000, 50000, 75000, 100000]}
              tickFormatter={(v) => `$${Math.round(v / 1000)}k`}
              className="text-xs text-[#666]"
            />
            <Bar dataKey="average" fill="var(--primary)" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ChartContainer>
        <div className="grid gap-2 md:grid-cols-3">
          {summaries.map((item) => (
            <div key={item.id} className="rounded-[8px] bg-[#f3f3f3] px-3 py-3">
              <p className="text-[12px] font-semibold leading-5 text-black">{item.department}</p>
              <p className="text-[12px] leading-5 text-[#666]">{item.employees}</p>
              <p className="text-[14px] font-medium leading-6 text-primary">{item.averageSalary}</p>
              <p className="text-[11px] leading-4 text-[#666]">{item.total}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
