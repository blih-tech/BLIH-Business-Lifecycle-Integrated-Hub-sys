import type { MonthlyAllowanceItem } from '@/features/hr/workforce/benefits/types';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent } from '@/shared/components/ui/card';

type MonthlyAllowanceCardProps = {
  item: MonthlyAllowanceItem;
};

export function MonthlyAllowanceCard({ item }: MonthlyAllowanceCardProps) {
  return (
    <Card className="gap-0 rounded-[12px] border-border py-0 shadow-none">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold tracking-[-0.2px] text-black">
            {item.title}
          </p>
          <Badge className="h-[22px] rounded-[6px] bg-primary px-2 text-[11px] font-medium text-white">
            {item.utilization}%
          </Badge>
        </div>
        <div className="space-y-1 text-xs text-[#666]">
          <div className="flex items-center justify-between">
            <span>Monthly Budget:</span>
            <span className="font-semibold text-black">{item.budget}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Employees:</span>
            <span className="font-semibold text-black">{item.employees}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Per Employee:</span>
            <span className="font-semibold text-primary">
              {item.perEmployee}
            </span>
          </div>
        </div>
        <div className="h-2 w-full rounded-full bg-[#dbe7ff]">
          <div
            className="h-2 rounded-full bg-primary"
            style={{ width: `${item.utilization}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
