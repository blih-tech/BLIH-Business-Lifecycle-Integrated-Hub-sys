import { CircleDollarSign, Clock3, Users } from 'lucide-react';

import type { WorkforceOverviewStat } from '@/features/hr/workforce/overview/types';
import { Card, CardContent } from '@/shared/components/ui/card';

type WorkforceOverviewStatCardProps = {
  item: WorkforceOverviewStat;
};

export function WorkforceOverviewStatCard({
  item,
}: WorkforceOverviewStatCardProps) {
  return (
    <Card className="gap-0 rounded-[10px] border-border py-0 shadow-none">
      <CardContent className="space-y-4 p-4">
        <div className="flex items-start justify-between">
          <div className="grid h-10 w-10 place-items-center rounded-[8px] bg-[rgba(30,102,247,0.1)] text-primary">
            {renderIcon(item.icon)}
          </div>
          <span className="inline-flex h-[22px] items-center rounded-[6px] border border-[#5f94ff] bg-[rgba(30,102,247,0.06)] px-2 text-xs text-primary">
            {item.chip}
          </span>
        </div>
        <div>
          <p className="text-xs text-[#666]">{item.label}</p>
          <p className="mt-1 text-[33px] font-semibold leading-8 tracking-[-0.3125px] text-black">
            {item.value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function renderIcon(icon: WorkforceOverviewStat['icon']) {
  if (icon === 'dollar') {
    return <CircleDollarSign className="h-5 w-5" />;
  }

  if (icon === 'users') {
    return <Users className="h-5 w-5" />;
  }

  return <Clock3 className="h-5 w-5" />;
}
