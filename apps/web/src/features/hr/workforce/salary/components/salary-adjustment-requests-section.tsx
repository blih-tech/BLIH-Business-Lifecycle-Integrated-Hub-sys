import { DollarSign } from "lucide-react";

import type { SalaryAdjustmentRequest } from "@/features/hr/workforce/salary/types";
import { Card, CardContent } from "@/shared/components/ui/card";

import { SalaryAdjustmentRequestCard } from "./salary-adjustment-request-card";

type SalaryAdjustmentRequestsSectionProps = {
  items: SalaryAdjustmentRequest[];
};

export function SalaryAdjustmentRequestsSection({ items }: SalaryAdjustmentRequestsSectionProps) {
  return (
    <Card className="gap-0 rounded-[12px] border-2 border-primary py-0 shadow-none">
      <CardContent className="space-y-4 p-4">
        <p className="flex items-center gap-2 text-base tracking-[-0.3125px] text-black">
          <DollarSign className="h-5 w-5 text-primary" />
          Salary Adjustment Requests
        </p>
        <div className="space-y-3">
          {items.map((item) => (
            <SalaryAdjustmentRequestCard key={item.id} item={item} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
