import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { cn } from '@/shared/lib/utils';

import type { TalentApprovalRequest } from '@/features/hr/talent/overview/types';

type ApprovalRequestCardProps = {
  item: TalentApprovalRequest;
};

export function ApprovalRequestCard({ item }: ApprovalRequestCardProps) {
  return (
    <Card className="gap-0 rounded-[10px] border-border py-0 shadow-none">
      <CardContent className="space-y-2.5 p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <div className="grid h-7 w-7 place-items-center rounded-full bg-primary text-[10px] font-semibold text-white">
                {item.initials}
              </div>
              <p className="text-sm font-semibold text-black">{item.name}</p>
              <Badge
                variant="outline"
                className="h-5 rounded-[4px] px-1.5 text-[9px] font-medium text-black"
              >
                {item.department}
              </Badge>
            </div>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2px] text-primary">
              {item.requestType}
            </p>
            <p className="text-xs text-[#666]">{item.title}</p>
            <p className="text-[10px] text-[#666]">Due: {item.dueDate}</p>
          </div>
          <Badge
            className={cn(
              'h-5 rounded-[4px] px-1.5 text-[9px] font-medium capitalize',
              item.priority === 'high'
                ? 'bg-[#e7000b] text-white'
                : item.priority === 'low'
                  ? 'bg-[#4caf50] text-white'
                  : 'bg-[#4a5565] text-white',
            )}
          >
            {item.priority}
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <Button size="sm" className="h-8 rounded-[6px] text-xs">
            Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 rounded-[6px] border-border bg-white text-xs text-black"
          >
            Justify
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
