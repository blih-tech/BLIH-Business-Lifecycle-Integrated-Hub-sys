import type { BudgetAllocationItem } from "@/features/hr/workforce/budget/types";
import { Card, CardContent } from "@/shared/components/ui/card";

import { BudgetAllocationCard } from "./budget-allocation-card";

type BudgetAllocationsSectionProps = {
  items: BudgetAllocationItem[];
};

export function BudgetAllocationsSection({ items }: BudgetAllocationsSectionProps) {
  return (
    <Card className="gap-0 rounded-[12px] border-border py-0 shadow-none">
      <CardContent className="space-y-3 p-4">
        <p className="text-sm font-medium tracking-[-0.176px] text-black">Current Budget Allocations</p>
        <div className="grid gap-4 lg:grid-cols-2">
          {items.map((item) => (
            <BudgetAllocationCard key={item.id} item={item} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
