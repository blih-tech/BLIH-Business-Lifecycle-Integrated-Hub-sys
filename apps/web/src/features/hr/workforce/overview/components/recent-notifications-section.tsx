import { AlertCircle, Bell, CheckCircle2, Clock3, Info } from 'lucide-react';

import type { WorkforceNotification } from '@/features/hr/workforce/overview/types';
import { Card, CardContent } from '@/shared/components/ui/card';

type RecentNotificationsSectionProps = {
  items: WorkforceNotification[];
};

export function RecentNotificationsSection({
  items,
}: RecentNotificationsSectionProps) {
  return (
    <Card className="gap-0 rounded-[10px] border-primary py-0 shadow-none">
      <CardContent className="space-y-4 p-4">
        <p className="flex items-center gap-2 text-sm leading-4 tracking-[-0.3125px] text-black">
          <Info className="h-4 w-4 text-primary" />
          Recent Notifications
        </p>
        <div className="grid gap-2 md:grid-cols-2">
          {items.map((item) => (
            <div key={item.id} className={getToneClassName(item.tone)}>
              <div className="mt-0.5">{renderToneIcon(item.tone)}</div>
              <div>
                <p className="text-sm leading-5 tracking-[-0.1504px] text-black">
                  {item.title}
                </p>
                <p className="text-xs text-[#666]">{item.date}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function getToneClassName(tone: WorkforceNotification['tone']) {
  if (tone === 'red') {
    return 'flex gap-2 rounded-[6px] bg-[rgba(231,0,11,0.06)] p-3';
  }

  if (tone === 'yellow') {
    return 'flex gap-2 rounded-[6px] bg-[rgba(254,199,46,0.15)] p-3';
  }

  if (tone === 'gray') {
    return 'flex gap-2 rounded-[6px] bg-[#f3f3f3] p-3';
  }

  return 'flex gap-2 rounded-[6px] bg-[rgba(30,102,247,0.08)] p-3';
}

function renderToneIcon(tone: WorkforceNotification['tone']) {
  if (tone === 'red') {
    return <AlertCircle className="h-4 w-4 text-[#e7000b]" />;
  }

  if (tone === 'yellow') {
    return <Clock3 className="h-4 w-4 text-[#ca8a04]" />;
  }

  if (tone === 'gray') {
    return <CheckCircle2 className="h-4 w-4 text-primary" />;
  }

  return <Bell className="h-4 w-4 text-primary" />;
}
