import type { DisciplineRateSnapshot } from '@/features/hr/talent/overview/types';
import { Card, CardContent } from '@/shared/components/ui/card';

type DisciplineRateCardProps = {
  item: DisciplineRateSnapshot;
};

export function DisciplineRateCard({ item }: DisciplineRateCardProps) {
  return (
    <Card className="gap-0 rounded-[8px] border-primary bg-[rgba(30,102,247,0.05)] py-0 shadow-none">
      <CardContent className="space-y-5 p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-primary">
            Average Discipline Rate
          </p>
          <p className="rounded-[4px] border border-primary px-1.5 py-0.5 text-xs text-primary">
            {item.averageRate}
          </p>
        </div>
        <div className="grid grid-cols-2">
          <div>
            <p className="text-xs text-[#666]">Pending Cases</p>
            <p className="text-[24px] font-semibold leading-7 text-black">
              {item.pendingCases}
            </p>
          </div>
          <div className="justify-self-end text-right">
            <p className="text-xs text-[#666]">Resolved Cases</p>
            <p className="text-[24px] font-semibold leading-7 text-black">
              {item.resolvedCases}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
