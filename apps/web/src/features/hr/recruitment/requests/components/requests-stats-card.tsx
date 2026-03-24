import { BriefcaseBusiness, CircleCheckBig, Clock3 } from 'lucide-react';

import type { RequestsStatItem } from '@/features/hr/recruitment/requests/types';

type RequestsStatsCardProps = {
  item: RequestsStatItem;
};

function iconFor(icon: RequestsStatItem['icon']) {
  if (icon === 'pending') return <Clock3 className="h-4 w-4 text-primary" />;
  if (icon === 'approved')
    return <CircleCheckBig className="h-4 w-4 text-primary" />;
  return <BriefcaseBusiness className="h-4 w-4 text-primary" />;
}

export function RequestsStatsCard({ item }: RequestsStatsCardProps) {
  return (
    <article className="ui-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="ui-label">{item.label}</p>
          <p className="ui-value mt-1 text-foreground">{item.value}</p>
        </div>
        <span className="inline-flex h-6 w-6 items-center justify-center">
          {iconFor(item.icon)}
        </span>
      </div>
    </article>
  );
}
