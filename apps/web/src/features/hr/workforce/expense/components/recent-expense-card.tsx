import type { RecentExpenseItem } from "@/features/hr/workforce/expense/types";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent } from "@/shared/components/ui/card";

type RecentExpenseCardProps = {
  item: RecentExpenseItem;
};

export function RecentExpenseCard({ item }: RecentExpenseCardProps) {
  return (
    <Card className="gap-0 rounded-[12px] border-border py-0 shadow-none">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-semibold tracking-[-0.2px] text-black">{item.title}</p>
            <Badge className="h-[22px] rounded-[6px] bg-primary px-2 text-[11px] font-medium text-white">
              {item.status}
            </Badge>
          </div>
          <p className="text-lg font-semibold tracking-[-0.4492px] text-primary">{item.amount}</p>
        </div>

        <div className="space-y-2 text-xs text-[#666]">
          <InfoRow label="From Budget:" value={item.fromBudget} />
          <InfoRow label="Responsible:" value={item.responsible} />
          <InfoRow label="Timeframe:" value={item.timeframe} />
          <InfoRow label="Date:" value={item.date} />
        </div>

        <div className="rounded-[4px] bg-[#f3f3f3] px-2 py-2 text-[11px] text-[#666]">{item.note}</div>
      </CardContent>
    </Card>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span>{label}</span>
      <span className="font-medium text-black">{value}</span>
    </div>
  );
}
