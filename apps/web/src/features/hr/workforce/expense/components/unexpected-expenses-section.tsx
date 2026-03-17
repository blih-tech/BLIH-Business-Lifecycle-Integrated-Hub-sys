import { AlertTriangle } from "lucide-react";

import type { UnexpectedExpenseItem } from "@/features/hr/workforce/expense/types";
import { Card, CardContent } from "@/shared/components/ui/card";

import { UnexpectedExpenseCard } from "./unexpected-expense-card";

type UnexpectedExpensesSectionProps = {
  items: UnexpectedExpenseItem[];
};

export function UnexpectedExpensesSection({ items }: UnexpectedExpensesSectionProps) {
  return (
    <Card className="gap-0 rounded-[12px] border-border py-0 shadow-none">
      <CardContent className="space-y-4 p-4">
        <div className="flex items-center gap-2 text-base tracking-[-0.3125px] text-black">
          <AlertTriangle className="h-4 w-4 text-[#e7000b]" />
          Unexpected Expenses
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <UnexpectedExpenseCard key={item.id} item={item} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
