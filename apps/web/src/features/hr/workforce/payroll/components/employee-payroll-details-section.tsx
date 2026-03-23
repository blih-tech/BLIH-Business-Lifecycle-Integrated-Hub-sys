import type { EmployeePayrollItem } from "@/features/hr/workforce/payroll/types";
import { Card, CardContent } from "@/shared/components/ui/card";

import { EmployeePayrollCard } from "./employee-payroll-card";

type EmployeePayrollDetailsSectionProps = {
  items: EmployeePayrollItem[];
};

export function EmployeePayrollDetailsSection({ items }: EmployeePayrollDetailsSectionProps) {
  return (
    <Card className="gap-0 rounded-[12px] border-border py-0 shadow-none">
      <CardContent className="space-y-3 p-4">
        <p className="text-sm font-medium tracking-[-0.176px] text-black">Employee Payroll Details ({items.length})</p>
        <div className="grid gap-2.5 lg:grid-cols-3">
          {items.map((item) => (
            <EmployeePayrollCard key={item.id} item={item} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
