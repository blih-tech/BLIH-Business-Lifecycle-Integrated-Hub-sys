import { Star } from "lucide-react";

import type { TopEmployee } from "@/features/hr/performance/overview/types";
import { Card, CardContent } from "@/shared/components/ui/card";

type TopPerformingEmployeesCardProps = {
  items: TopEmployee[];
};

export function TopPerformingEmployeesCard({ items }: TopPerformingEmployeesCardProps) {
  return (
    <Card className="gap-0 rounded-[10px] border-primary py-0 shadow-none">
      <CardContent className="p-3 md:p-4">
        <p className="mb-3 text-xs text-black">Top Performing Employees</p>
        <div className="space-y-2">
          {items.map((employee) => (
            <div key={employee.id} className="flex items-center justify-between rounded-[8px] border border-border bg-card p-2.5">
              <div className="flex items-center gap-2.5">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-primary text-[10px] font-semibold text-white">
                  {employee.initials}
                </div>
                <div>
                  <p className="text-xs font-medium text-black">{employee.name}</p>
                  <p className="text-[10px] text-[#666]">{employee.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-xs font-semibold text-primary">
                  <Star className="h-3 w-3 fill-primary text-primary" />
                  {employee.rating.toFixed(1)}
                </div>
                <span className="rounded-[3px] bg-[#f3f3f3] px-1.5 py-0.5 text-[9px] text-black">OKR: {employee.okr}%</span>
                <span className="rounded-[3px] bg-[#f3f3f3] px-1.5 py-0.5 text-[9px] text-black">KPI: {employee.kpi}%</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
