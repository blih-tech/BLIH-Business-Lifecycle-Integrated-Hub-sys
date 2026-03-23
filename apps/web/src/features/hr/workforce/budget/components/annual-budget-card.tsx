import type { AnnualBudgetItem } from '@/features/hr/workforce/budget/types';
import { Card, CardContent } from '@/shared/components/ui/card';

type AnnualBudgetCardProps = {
  item: AnnualBudgetItem;
};

export function AnnualBudgetCard({ item }: AnnualBudgetCardProps) {
  return (
    <Card className="gap-0 rounded-[12px] border-border py-0 shadow-none">
      <CardContent className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-base font-semibold tracking-[-0.3px] text-black">
              {item.yearLabel}
            </p>
            <p className="text-xs text-[#666]">{item.variance}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#666]">Total Budget</p>
            <p className="text-lg font-semibold tracking-[0.0703px] text-primary">
              {item.totalBudget}
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <MetricBlock label="Total Allocated" value={item.totalAllocated} />
          <MetricBlock label="Total Spent" value={item.totalSpent} />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold tracking-[-0.15px] text-black">
            Department Breakdown
          </p>
          <div className="grid gap-1.5 md:grid-cols-3">
            {item.breakdown.map((entry) => (
              <div key={entry.id} className="rounded-[6px] bg-[#f3f3f3] p-2">
                <p className="text-[11px] font-medium text-black">
                  {entry.department}
                </p>
                <div className="mt-1 flex items-center justify-between text-[11px] text-[#666]">
                  <span>{entry.allocated}</span>
                  <span className="text-primary">{entry.spent}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MetricBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] bg-[#f3f3f3] px-3 py-2">
      <p className="text-[11px] text-[#666]">{label}</p>
      <p className="text-base font-semibold tracking-[-0.3px] text-black">
        {value}
      </p>
    </div>
  );
}
