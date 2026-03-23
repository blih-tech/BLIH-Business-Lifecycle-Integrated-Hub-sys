'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import type {
  DepartmentBenefitPoint,
  DepartmentBenefitSummary,
} from '@/features/hr/workforce/benefits/types';
import { ChartContainer } from '@/shared/components/ui/chart';
import { Card, CardContent } from '@/shared/components/ui/card';

type BenefitsValueByDepartmentSectionProps = {
  data: DepartmentBenefitPoint[];
  summaries: DepartmentBenefitSummary[];
};

const chartConfig = {
  value: { label: 'Benefits Value', color: '#1e66f7' },
};

export function BenefitsValueByDepartmentSection({
  data,
  summaries,
}: BenefitsValueByDepartmentSectionProps) {
  return (
    <Card className="gap-0 rounded-[12px] border-border py-0 shadow-none">
      <CardContent className="space-y-4 p-4">
        <p className="text-sm font-medium tracking-[-0.176px] text-black">
          Benefits Value by Department
        </p>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart
            data={data}
            margin={{ left: 4, right: 8, top: 6, bottom: 0 }}
            barCategoryGap={12}
          >
            <CartesianGrid
              stroke="#e5e7eb"
              strokeDasharray="3 3"
              vertical={true}
            />
            <XAxis
              dataKey="department"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="text-xs text-[#666]"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={6}
              ticks={[0, 250, 500, 750, 1000]}
              className="text-xs text-[#666]"
              tickFormatter={(value) => `$${value}k`}
            />
            <Bar
              dataKey="value"
              fill="var(--color-value)"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ChartContainer>

        <div className="grid gap-4 md:grid-cols-3">
          {summaries.map((summary) => (
            <div
              key={summary.id}
              className="rounded-[10px] border border-[#e5e5e5] bg-white px-3 py-2"
            >
              <p className="text-sm font-semibold text-black">
                {summary.department}
              </p>
              <div className="mt-1 flex items-center justify-between text-xs text-[#666]">
                <span>{summary.employees}</span>
                <span>{summary.average}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
