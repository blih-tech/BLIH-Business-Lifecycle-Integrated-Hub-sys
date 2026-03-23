import type { ResignationNotification } from '@/features/hr/exit/overview/types';

import { ResignationNotificationCard } from './resignation-notification-card';

type ActiveResignationNotificationsSectionProps = {
  items: ResignationNotification[];
};

export function ActiveResignationNotificationsSection({
  items,
}: ActiveResignationNotificationsSectionProps) {
  return (
    <section className="space-y-3">
      <p className="text-base font-medium tracking-[-0.176px] text-black">
        Active Resignation Notifications
      </p>
      <div className="grid gap-3 lg:grid-cols-2">
        {items.map((item) => (
          <ResignationNotificationCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
