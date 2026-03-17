import { CalendarDays } from "lucide-react";

import type { PayrollScheduleItem } from "@/features/hr/workforce/payroll/types";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent } from "@/shared/components/ui/card";

type PayrollScheduleCardProps = {
  item: PayrollScheduleItem;
};

const typeStyles: Record<PayrollScheduleItem["type"], string> = {
  scheduled: "bg-[#eaf2ff] text-primary",
  bonus: "bg-[#ecfdf3] text-[#027a48]",
  commission: "bg-[#fff7ed] text-[#c2410c]",
  overtime: "bg-[#fef2f2] text-[#b91c1c]",
};

export function PayrollScheduleCard({ item }: PayrollScheduleCardProps) {
  return (
    <Card className="gap-0 rounded-[10px] border-border py-0 shadow-none">
      <CardContent className="flex items-center justify-between p-3">
        <div className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 place-items-center rounded-[8px] bg-[#eaf2ff] text-primary">
            <CalendarDays className="h-4 w-4" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-semibold tracking-[-0.15px] text-black">{item.date}</p>
              <Badge className={`h-[18px] rounded-[5px] px-1.5 text-[10px] font-medium capitalize ${typeStyles[item.type]}`}>
                {item.type}
              </Badge>
            </div>
            <p className="text-[11px] leading-4 text-[#666]">{item.daysLeft}</p>
          </div>
        </div>
        <p className="text-sm font-semibold tracking-[-0.2px] text-primary">{item.amount}</p>
      </CardContent>
    </Card>
  );
}
