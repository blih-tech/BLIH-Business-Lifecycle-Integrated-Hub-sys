import { Eye } from "lucide-react";

import type { EmployeeSalaryItem } from "@/features/hr/workforce/salary/types";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";

type EmployeeSalarySectionProps = {
  items: EmployeeSalaryItem[];
};

export function EmployeeSalarySection({ items }: EmployeeSalarySectionProps) {
  return (
    <Card className="gap-0 rounded-[12px] border-border py-0 shadow-none">
      <CardContent className="space-y-3 p-4">
        <p className="text-sm tracking-[-0.3125px] text-black">Employee Salary Details</p>
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="rounded-[12px] border border-[#e5e5e5] bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-primary text-base font-semibold text-white">
                    {item.initials}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <p className="text-base font-semibold tracking-[-0.3125px] text-black">{item.name}</p>
                      <span className="inline-flex h-[22px] items-center rounded-[6px] border border-[#e5e5e5] px-[9px] text-xs font-medium text-black">
                        {item.department}
                      </span>
                    </div>
                    <p className="text-sm text-[#666]">{item.role}</p>
                    <div className="grid gap-4 md:grid-cols-3">
                      <InfoCell label="Annual Salary" value={item.annualSalary} />
                      <InfoCell label="Performance" value={item.performance} />
                      <InfoCell label="Join Date" value={item.joinDate} />
                    </div>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="h-8 rounded-[6px] border-[#e5e5e5] bg-white text-sm text-black hover:bg-white">
                  <Eye className="h-4 w-4" />
                  View
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-[#666]">{label}</p>
      <p className="text-base font-semibold leading-6 tracking-[-0.3125px] text-black">{value}</p>
    </div>
  );
}
