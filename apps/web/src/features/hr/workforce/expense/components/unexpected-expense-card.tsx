import type { UnexpectedExpenseItem } from "@/features/hr/workforce/expense/types";
import { Card, CardContent } from "@/shared/components/ui/card";

type UnexpectedExpenseCardProps = {
  item: UnexpectedExpenseItem;
};

export function UnexpectedExpenseCard({ item }: UnexpectedExpenseCardProps) {
  return (
    <Card className="gap-0 rounded-[8px] border-0 bg-[#fef2f2] py-0 shadow-none">
      <CardContent className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold tracking-[-0.2px] text-black">{item.title}</p>
            <p className="text-xs text-[#666]">Date: {item.date}</p>
          </div>
          <p className="text-lg font-semibold tracking-[-0.4492px] text-[#e7000b]">{item.amount}</p>
        </div>
        <div className="flex items-center justify-between text-xs text-[#666]">
          <span>
            Covered by: <span className="font-medium">{item.coveredBy}</span>
          </span>
          <span>
            Approved by: <span className="font-medium">{item.approvedBy}</span>
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
