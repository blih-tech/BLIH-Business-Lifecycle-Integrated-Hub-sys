import { BadgeCheck } from 'lucide-react';

import type { SalaryAdjustmentRequest } from '@/features/hr/workforce/salary/types';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';

type SalaryAdjustmentRequestCardProps = {
  item: SalaryAdjustmentRequest;
};

export function SalaryAdjustmentRequestCard({
  item,
}: SalaryAdjustmentRequestCardProps) {
  return (
    <Card className="gap-0 rounded-[12px] border-border py-0 shadow-none">
      <CardContent className="space-y-3 p-4">
        <div className="flex gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-primary text-base font-semibold text-white">
            {item.initials}
          </div>
          <div className="w-full space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <p className="text-[16px] font-semibold leading-6 tracking-[-0.3125px] text-black">
                  {item.name}
                </p>
                <span className="inline-flex h-[22px] items-center rounded-[6px] border border-[#e5e5e5] px-[9px] text-xs font-medium text-black">
                  {item.department}
                </span>
              </div>
              <span className="inline-flex h-[22px] items-center rounded-[6px] bg-primary px-[9px] text-xs font-medium text-white">
                Performance: {item.performance}
              </span>
            </div>
            <div className="grid gap-3 lg:grid-cols-[173px_173px_173px_1fr]">
              <MiniCard label="Current Salary" value={item.currentSalary} />
              <MiniCard
                label="Requested Salary"
                value={item.requestedSalary}
                valueClass="text-primary"
              />
              <MiniCard
                label="Increase"
                value={item.increase}
                tone="blue"
                valueClass="text-primary"
              />
              <div className="rounded-[8px] bg-[#f3f3f3] px-3 py-3">
                <p className="text-sm leading-5 tracking-[-0.1504px] text-black">
                  <span className="font-medium">Reason:</span> {item.reason}
                </p>
                <p className="mt-1 text-xs text-[#666]">
                  Requested: {item.requestedDate}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button className="h-9 min-w-[200px] rounded-[6px] text-sm">
            <BadgeCheck className="h-4 w-4" />
            Approve
          </Button>
          <Button
            variant="outline"
            className="h-9 min-w-[200px] rounded-[6px] border-[#e5e5e5] bg-white text-sm text-black hover:bg-white"
          >
            Reject
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function MiniCard({
  label,
  value,
  valueClass,
  tone = 'gray',
}: {
  label: string;
  value: string;
  valueClass?: string;
  tone?: 'gray' | 'blue';
}) {
  return (
    <div
      className={
        tone === 'blue'
          ? 'rounded-[8px] bg-[rgba(30,102,247,0.1)] px-3 py-3'
          : 'rounded-[8px] bg-[#f3f3f3] px-3 py-3'
      }
    >
      <p className="text-xs text-[#666]">{label}</p>
      <p
        className={`mt-1 text-[16px] font-semibold leading-6 tracking-[-0.3125px] text-black ${valueClass ?? ''}`}
      >
        {value}
      </p>
    </div>
  );
}
