import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import type { WorkforcePendingApproval } from '@/features/hr/workforce/overview/types';

type PendingApprovalCardProps = {
  item: WorkforcePendingApproval;
};

export function PendingApprovalCard({ item }: PendingApprovalCardProps) {
  return (
    <Card className="gap-0 rounded-[10px] border-border py-0 shadow-none">
      <CardContent className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-base font-semibold leading-6 tracking-[-0.3125px] text-black">
                {item.title}
              </p>
              <span className={getPriorityClassName(item.priority)}>
                {item.priority}
              </span>
            </div>
            <p className="text-xs text-[#666]">{item.employee}</p>
            <p className="text-xs text-black">{item.reason}</p>
          </div>
          <div className="text-right">
            <p className="text-[24px] font-semibold leading-7 tracking-[-0.4395px] text-primary">
              {item.amount}
            </p>
            <p className="text-[11px] text-[#666]">
              Requested: {item.requestedDate}
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8 min-w-[98px] rounded-[6px] border-[#e5e5e5] bg-white text-sm text-black hover:bg-white"
          >
            Reject
          </Button>
          <Button
            size="sm"
            className="h-8 min-w-[88px] rounded-[6px] px-4 text-sm"
          >
            Approve
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function getPriorityClassName(priority: WorkforcePendingApproval['priority']) {
  if (priority === 'high') {
    return 'inline-flex h-[22px] items-center rounded-[6px] bg-[rgba(231,0,11,0.08)] px-[9px] text-xs font-medium text-[#e7000b]';
  }

  if (priority === 'low') {
    return 'inline-flex h-[22px] items-center rounded-[6px] bg-[#f3f3f3] px-[9px] text-xs font-medium text-[#666]';
  }

  return 'inline-flex h-[22px] items-center rounded-[6px] bg-[rgba(30,102,247,0.1)] px-[9px] text-xs font-medium text-primary';
}
