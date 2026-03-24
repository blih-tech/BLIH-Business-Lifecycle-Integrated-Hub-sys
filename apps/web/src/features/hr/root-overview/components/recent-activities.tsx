import type {
  ActivityStatusTone,
  RootOverviewActivityItem,
} from '@/features/hr/root-overview/types';
import { cn } from '@/shared/lib/utils';

type RecentActivitiesProps = {
  items: RootOverviewActivityItem[];
};

function statusToneClass(tone: ActivityStatusTone) {
  if (tone === 'active') return 'bg-[#1e66f7] text-white';
  if (tone === 'completed') return 'bg-[#f5f5f5] text-black';
  if (tone === 'pending') return 'bg-white text-black border border-[#e5e5e5]';
  return 'bg-[#f5f5f5] text-black';
}

export function RecentActivities({ items }: RecentActivitiesProps) {
  return (
    <section className="ui-surface p-4 md:p-5">
      <h2 className="ui-section-title text-foreground">Recent Activities</h2>
      <div className="mt-3">
        {items.map((item, index) => (
          <div
            key={item.id}
            className={cn(
              'py-2.5',
              index < items.length - 1 ? 'border-b border-border' : '',
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="ui-body font-medium text-foreground">
                {item.category}
              </p>
              <span
                className={cn(
                  'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
                  statusToneClass(item.statusTone),
                )}
              >
                {item.status}
              </span>
            </div>
            <p className="ui-body mt-1 text-muted-foreground">{item.title}</p>
            <p className="ui-meta mt-1">{item.timeAgo}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
