import type { ExpenseHistoryItem } from "@/features/hr/workforce/expense/types";
import { Card, CardContent } from "@/shared/components/ui/card";

type ExpenseHistoryCardProps = {
  item: ExpenseHistoryItem;
};

export function ExpenseHistoryCard({ item }: ExpenseHistoryCardProps) {
  return (
    <Card className="gap-0 rounded-[12px] border-border py-0 shadow-none">
      <CardContent className="space-y-4 p-4">
        <div className="flex items-center justify-between gap-4">
          <p className="text-lg font-semibold tracking-[-0.4395px] text-black">{item.monthLabel}</p>
          <div className="text-right">
            <p className="text-xs text-[#666]">Total Expenses</p>
            <p className="text-[22px] font-semibold tracking-[0.0703px] text-primary">{item.totalExpenses}</p>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-5">
          {item.categories.map((category) => (
            <div key={category.id} className="rounded-[8px] bg-[#f3f3f3] px-3 py-2">
              <p className="text-[11px] text-[#666]">{category.label}</p>
              <p className="text-sm font-semibold tracking-[-0.15px] text-black">{category.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
