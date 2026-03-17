import { CalendarDays } from "lucide-react";

import type { BudgetAllocationItem } from "@/features/hr/workforce/budget/types";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent } from "@/shared/components/ui/card";

type BudgetAllocationCardProps = {
  item: BudgetAllocationItem;
};

export function BudgetAllocationCard({ item }: BudgetAllocationCardProps) {
  return (
    <Card className="gap-0 rounded-[12px] border-border py-0 shadow-none">
      <CardContent className="space-y-3 p-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold tracking-[-0.176px] text-black">{item.title}</p>
            <span className="inline-flex h-[22px] items-center gap-1 rounded-[6px] border border-[#e5e5e5] bg-white px-2 text-[11px] text-[#666]">
              <CalendarDays className="h-3 w-3 text-[#666]" />
              {item.period}
            </span>
          </div>
          <p className="text-xs text-[#666]">{item.description}</p>
          <div className="flex flex-wrap items-center gap-1.5">
            {item.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="h-[22px] rounded-[6px] px-2 text-[10px] font-medium text-black">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <MetricBlock label="Allocated" value={item.allocated} />
          <MetricBlock label="Spent" value={item.spent} valueClassName="text-primary" />
          <MetricBlock label="Remaining" value={item.remaining} valueClassName="text-primary" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-[#666]">
            <span>Utilization</span>
            <span className="text-black">{item.utilization}</span>
          </div>
          <div className="h-2 w-full rounded-full bg-[#e5e5e5]">
            <div className="h-2 rounded-full bg-primary" style={{ width: `${item.utilizationValue}%` }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MetricBlock({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-[8px] bg-[#f3f3f3] px-3 py-2">
      <p className="text-[11px] text-[#666]">{label}</p>
      <p className={`text-sm font-semibold tracking-[-0.2px] text-black ${valueClassName ?? ""}`}>{value}</p>
    </div>
  );
}
