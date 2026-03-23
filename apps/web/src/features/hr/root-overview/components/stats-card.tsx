import type { RootOverviewStatItem } from '@/features/hr/root-overview/types';
import { cn } from '@/shared/lib/utils';

type StatsCardProps = RootOverviewStatItem;

function deltaToneClass(tone: RootOverviewStatItem['deltaTone']) {
  if (tone === 'positive') return 'text-[#1e66f7]';
  if (tone === 'negative') return 'text-[#1e66f7]';
  return 'text-muted-foreground';
}

export function StatsCard({
  label,
  value,
  deltaText,
  deltaTone,
}: StatsCardProps) {
  return (
    <article className="ui-surface p-4 md:p-5">
      <p className="ui-label">{label}</p>
      <div className="mt-1 flex items-end gap-1.5">
        <p className="ui-value text-foreground">{value}</p>
        {deltaText ? (
          <span className={cn('ui-body pb-0.5', deltaToneClass(deltaTone))}>
            {deltaText}
          </span>
        ) : null}
      </div>
    </article>
  );
}
