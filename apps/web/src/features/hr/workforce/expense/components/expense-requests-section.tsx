import { Clock } from "lucide-react";

import type { ExpenseRequestItem } from "@/features/hr/workforce/expense/types";
import { Card, CardContent } from "@/shared/components/ui/card";

import { ExpenseRequestCard } from "./expense-request-card";

type ExpenseRequestsSectionProps = {
  items: ExpenseRequestItem[];
};

export function ExpenseRequestsSection({ items }: ExpenseRequestsSectionProps) {
  return (
    <Card className="gap-0 rounded-[12px] border-2 border-primary py-0 shadow-none">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center gap-2 text-base tracking-[-0.3125px] text-black">
          <Clock className="h-4 w-4 text-primary" />
          Expense Requests Awaiting Approval ({items.length})
        </div>
        <div className="space-y-3">
          {items.map((item) => (
            <ExpenseRequestCard key={item.id} item={item} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
