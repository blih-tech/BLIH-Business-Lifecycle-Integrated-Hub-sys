import { Check } from "lucide-react";

import type { ExpenseRequestItem } from "@/features/hr/workforce/expense/types";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";

type ExpenseRequestCardProps = {
  item: ExpenseRequestItem;
};

const priorityClasses: Record<ExpenseRequestItem["priority"], string> = {
  high: "bg-primary text-white",
  medium: "bg-[#4a5565] text-white",
};

export function ExpenseRequestCard({ item }: ExpenseRequestCardProps) {
  return (
    <Card className="gap-0 rounded-[12px] border-border py-0 shadow-none">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold tracking-[-0.2px] text-black">{item.title}</p>
              <Badge className={`h-[22px] rounded-[6px] px-2 text-[11px] font-medium capitalize ${priorityClasses[item.priority]}`}>
                {item.priority}
              </Badge>
            </div>
            <p className="text-xs text-[#666]">{item.department}</p>
          </div>
          <p className="text-[22px] font-semibold tracking-[0.0703px] text-primary">{item.amount}</p>
        </div>

        <div className="rounded-[8px] bg-[#f3f3f3] px-3 py-2 text-sm text-black">
          <span className="font-medium">Reason:</span> <span className="text-[#666]">{item.reason}</span>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <InfoBlock label="Budget" value={item.budget} />
          <InfoBlock label="Responsible" value={item.responsible} />
          <InfoBlock label="Requested" value={item.requested} />
        </div>

        <div className="grid gap-2 md:grid-cols-2">
          <Button size="sm" className="h-9 rounded-[6px] text-sm">
            <Check className="h-4 w-4" />
            Approve
          </Button>
          <Button size="sm" variant="outline" className="h-9 rounded-[6px] border-[#e5e5e5] bg-white text-sm text-black">
            Reject
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[6px] bg-[#f3f3f3] px-2 py-2">
      <p className="text-[11px] text-[#666]">{label}</p>
      <p className="text-sm font-medium tracking-[-0.15px] text-black">{value}</p>
    </div>
  );
}
