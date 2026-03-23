'use client';

import { ArrowUpRight, ChevronDown, Sparkles } from 'lucide-react';
import { CartesianGrid, Line, LineChart, XAxis } from 'recharts';

import type { DirectoryEmployee } from '@/features/hr/people/directory/types';
import { Button } from '@/shared/components/ui/button';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/shared/components/ui/chart';
import { Separator } from '@/shared/components/ui/separator';

type SelectedEmployeeCardProps = {
  employee: DirectoryEmployee;
};

const weeklyPerformanceData = [
  { day: 'Mon', performance: 84 },
  { day: 'Tue', performance: 86 },
  { day: 'Wed', performance: 89 },
  { day: 'Thu', performance: 79 },
  { day: 'Fri', performance: 87 },
  { day: 'Sat', performance: 86 },
  { day: 'Sun', performance: 91 },
];

const chartConfig = {
  performance: {
    label: 'Performance',
    color: '#1e66f7',
  },
} satisfies ChartConfig;

export function SelectedEmployeeCard({ employee }: SelectedEmployeeCardProps) {
  return (
    <aside className="flex h-[800px] flex-col justify-between rounded-[12px] border border-border bg-card p-[25px]">
      <div className="space-y-4">
        <div className="flex items-start gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            {employee.initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-base font-medium text-foreground">
                  {employee.name}
                </p>
                <p className="text-sm text-muted-foreground">{employee.role}</p>
              </div>
              <span className="rounded-[4px] bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                {employee.technicalDepartmentLabel}
              </span>
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {employee.email}
            </p>
            <p className="text-sm text-muted-foreground">{employee.phone}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-2 gap-y-4 rounded-[8px] bg-muted p-4">
          <div>
            <p className="text-[11px] text-muted-foreground">Start Date</p>
            <p className="text-sm font-semibold text-foreground">
              {employee.startDate}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Job Type:</p>
            <p className="text-sm font-semibold text-foreground">
              {employee.jobType}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Work Hours</p>
            <p className="text-sm font-semibold text-foreground">
              {employee.workHours}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">
              Salary & Payroll
            </p>
            <p className="text-sm font-semibold text-foreground">
              {employee.salary}
            </p>
          </div>
        </div>

        <div>
          <p className="text-base font-medium text-foreground">Role Overview</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {employee.roleOverview}
          </p>
        </div>

        <div className="rounded-[8px] border border-primary bg-primary/10 p-2">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-foreground">
                Weekly Performance
              </p>
              <ChevronDown className="h-4 w-4 text-foreground/80" />
            </div>
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <ChartContainer
            config={chartConfig}
            className="h-[125px] w-full !aspect-auto"
          >
            <LineChart
              accessibilityLayer
              data={weeklyPerformanceData}
              margin={{ top: 8, right: 2, left: 2, bottom: 0 }}
            >
              <CartesianGrid
                vertical
                horizontal={false}
                stroke="var(--border)"
                strokeDasharray="3 3"
              />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tickMargin={10}
                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent formatter={(value) => `${value}%`} />
                }
              />
              <Line
                type="monotone"
                dataKey="performance"
                stroke="var(--color-performance)"
                strokeWidth={2.5}
                dot={{
                  r: 2.2,
                  fill: 'var(--color-performance)',
                  strokeWidth: 0,
                }}
                activeDot={{ r: 3 }}
              />
            </LineChart>
          </ChartContainer>
        </div>

        <div className="rounded-[8px] border border-primary bg-primary/10 p-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] text-muted-foreground">
                Avg Completion Rate
              </p>
              <p className="text-[30px] font-semibold leading-8 text-primary">
                {employee.rank}%
              </p>
            </div>
            <Separator orientation="vertical" className="h-12 bg-border" />
            <div className="text-right">
              <p className="text-[28px] font-semibold leading-7 text-primary">
                4.6<span className="text-sm text-foreground">/5</span>
              </p>
              <p className="text-[10px] text-foreground">OKR: 90% | KPI: 88%</p>
            </div>
          </div>
        </div>
      </div>

      <Button className="h-8 w-full rounded-[6px] text-sm font-medium">
        View Full Profile
        <ArrowUpRight className="h-4 w-4" />
      </Button>
    </aside>
  );
}
