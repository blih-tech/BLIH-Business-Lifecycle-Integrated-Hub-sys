import { BookOpen, BriefcaseBusiness, Clock3, Users } from 'lucide-react';

import type { TalentOverviewStat } from '@/features/hr/talent/overview/types';
import { Card, CardContent } from '@/shared/components/ui/card';

type OverviewStatCardProps = {
  item: TalentOverviewStat;
};

export function OverviewStatCard({ item }: OverviewStatCardProps) {
  return (
    <Card className="gap-0 rounded-[10px] border-border py-0 shadow-none">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs text-[#666]">{item.label}</p>
            <p className="mt-1 text-[26px] font-semibold leading-7 text-black">
              {item.value}
            </p>
          </div>
          <div className="text-primary">{renderStatIcon(item.icon)}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function renderStatIcon(icon: TalentOverviewStat['icon']) {
  if (icon === 'training') {
    return <BookOpen className="h-4 w-4" />;
  }
  if (icon === 'culture') {
    return <Users className="h-4 w-4" />;
  }
  if (icon === 'pending') {
    return <Clock3 className="h-4 w-4" />;
  }
  return <BriefcaseBusiness className="h-4 w-4" />;
}
