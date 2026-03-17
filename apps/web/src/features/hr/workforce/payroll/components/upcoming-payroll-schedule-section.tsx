import type { PayrollScheduleItem } from "@/features/hr/workforce/payroll/types";
import { Card, CardContent } from "@/shared/components/ui/card";

import { PayrollScheduleCard } from "./payroll-schedule-card";

type UpcomingPayrollScheduleSectionProps = {
  items: PayrollScheduleItem[];
};

export function UpcomingPayrollScheduleSection({ items }: UpcomingPayrollScheduleSectionProps) {
  return (
    <Card className="gap-0 rounded-[12px] border-border py-0 shadow-none">
      <CardContent className="space-y-3 p-4">
        <p className="text-sm font-medium tracking-[-0.176px] text-black">Upcoming Payroll Schedule (Next 5 Days)</p>
        <div className="grid gap-2.5 md:grid-cols-2">
          {items.map((item) => (
            <PayrollScheduleCard key={item.id} item={item} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
