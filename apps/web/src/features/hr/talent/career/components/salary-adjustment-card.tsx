import type { SalaryAdjustmentRequest } from '@/features/hr/talent/career/types';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';

type SalaryAdjustmentCardProps = {
  item: SalaryAdjustmentRequest;
};

export function SalaryAdjustmentCard({ item }: SalaryAdjustmentCardProps) {
  return (
    <Card className="gap-0 rounded-[10px] border-border py-0 shadow-none">
      <CardContent className="space-y-2.5 p-3">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-primary text-[10px] font-semibold text-white">
            {item.initials}
          </div>
          <div>
            <p className="text-sm font-semibold text-black">{item.name}</p>
            <p className="text-[10px] text-[#666]">{item.department}</p>
          </div>
        </div>

        <div className="space-y-1 text-xs">
          <div className="flex items-center justify-between">
            <p className="text-[#666]">Current Salary:</p>
            <p className="font-medium text-black">{item.currentSalary}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[#666]">Requested:</p>
            <p className="font-semibold text-primary">{item.requestedSalary}</p>
          </div>
        </div>

        <div className="rounded-[4px] bg-[#f3f3f3] p-2">
          <p className="text-[10px] text-[#666]">{item.reason}</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button size="sm" className="h-8 rounded-[6px] text-xs">
            Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 rounded-[6px] border-border bg-white text-xs text-black"
          >
            Reject
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
