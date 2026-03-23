import type { PreviousPromotionRequest } from '@/features/hr/talent/career/types';
import { Card, CardContent } from '@/shared/components/ui/card';
import { cn } from '@/shared/lib/utils';

type PreviousPromotionCardProps = {
  item: PreviousPromotionRequest;
};

export function PreviousPromotionCard({ item }: PreviousPromotionCardProps) {
  return (
    <Card className="gap-0 rounded-[10px] border-border py-0 shadow-none">
      <CardContent className="space-y-2.5 p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-[#4a5565] text-[10px] font-semibold text-white">
              {item.initials}
            </div>
            <div>
              <p className="text-sm font-semibold text-black">{item.name}</p>
              <p className="text-[10px] text-[#666]">{item.department}</p>
            </div>
          </div>
          <span
            className={cn(
              'rounded-[4px] px-1.5 py-0.5 text-[9px] font-medium text-white',
              item.status === 'approved' ? 'bg-primary' : 'bg-[#e7000b]',
            )}
          >
            {item.status}
          </span>
        </div>

        <div className="space-y-1 text-xs">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[#666]">From:</p>
            <p className="font-medium text-[rgba(0,0,0,0.8)]">
              {item.fromRole}
            </p>
          </div>
          <div className="flex items-center justify-between gap-3">
            <p className="text-[#666]">To:</p>
            <p className="font-medium text-[rgba(0,0,0,0.8)]">{item.toRole}</p>
          </div>
          {item.approvedAt ? (
            <div className="flex items-center justify-between gap-3">
              <p className="text-[#666]">Approved:</p>
              <p className="font-semibold text-black">{item.approvedAt}</p>
            </div>
          ) : null}
        </div>

        {item.note ? (
          <div className="rounded-[4px] bg-[#f3f3f3] p-2">
            <p className="text-[10px] text-[#666]">{item.note}</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
