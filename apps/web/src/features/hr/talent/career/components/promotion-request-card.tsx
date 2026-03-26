import { ArrowRight, CircleCheck } from "lucide-react";

import type { PromotionRequest } from "@/features/hr/talent/career/types";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";

type PromotionRequestCardProps = {
  item: PromotionRequest;
};

export function PromotionRequestCard({ item }: PromotionRequestCardProps) {
  return (
    <Card className="gap-0 rounded-[10px] border-border py-0 shadow-none">
      <CardContent className="space-y-3 p-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-primary text-[10px] font-semibold text-white">
              {item.initials}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-semibold text-black">{item.name}</p>
                <span className="rounded-[4px] border border-border px-1.5 py-0.5 text-[9px] text-black">{item.department}</span>
              </div>
              <p className="text-[10px] text-[#666]">
                {item.manager} • {item.submittedAt}
              </p>
            </div>
          </div>
          <p className="text-[10px] text-[#666]">{item.yearsInRole}</p>
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-[6px] bg-[#f3f3f3] p-3">
          <div>
            <p className="text-[10px] text-[#666]">Current</p>
            <p className="text-sm font-semibold text-black">{item.currentRole}</p>
          </div>
          <ArrowRight className="h-4 w-4 text-primary" />
          <div>
            <p className="text-[10px] text-[#666]">Proposed</p>
            <p className="text-sm font-semibold text-primary">{item.proposedRole}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-[6px] bg-[#f3f3f3] p-2">
            <p className="text-[10px] text-[#666]">Salary Increase</p>
            <p className="text-sm font-semibold text-primary">{item.salaryIncrease}</p>
          </div>
          <div className="rounded-[6px] bg-[#f3f3f3] p-2">
            <p className="text-[10px] text-[#666]">Status</p>
            <span className="rounded-[4px] bg-[#fbe58e] px-1.5 py-0.5 text-[10px] font-medium text-black">
              {item.status}
            </span>
          </div>
        </div>

        <div className="rounded-[6px] bg-[#f3f3f3] p-2">
          <p className="text-[10px] text-[#666]">
            <span className="font-medium text-black">Justification:</span> {item.justification}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button size="sm" className="h-8 rounded-[6px] text-xs">
            <CircleCheck className="h-3.5 w-3.5" />
            Approve
          </Button>
          <Button size="sm" variant="outline" className="h-8 rounded-[6px] border-border bg-white text-xs text-black">
            Reject
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
