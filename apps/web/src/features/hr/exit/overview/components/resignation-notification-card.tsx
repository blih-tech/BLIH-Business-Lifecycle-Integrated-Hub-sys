import type { ResignationNotification } from '@/features/hr/exit/overview/types';
import { Card, CardContent } from '@/shared/components/ui/card';

type ResignationNotificationCardProps = {
  item: ResignationNotification;
};

export function ResignationNotificationCard({
  item,
}: ResignationNotificationCardProps) {
  return (
    <Card className="gap-0 rounded-[12px] border-2 border-[#e7000b] py-0 shadow-none">
      <CardContent className="space-y-0 px-[18px] pb-[18px] pt-[18px]">
        <div className="flex items-start gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary text-base font-semibold tracking-[-0.3125px] text-white">
            {item.initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <p className="text-base font-semibold tracking-[-0.3125px] text-black">
                  {item.name}
                </p>
                <span className="inline-flex h-[22px] items-center justify-center rounded-[6px] border border-[#e5e5e5] px-[9px] text-xs font-medium text-black">
                  {item.department}
                </span>
              </div>
              <span className="inline-flex h-[22px] items-center justify-center rounded-[6px] bg-[#e7000b] px-[9px] text-xs font-medium text-white">
                {item.priority}
              </span>
            </div>
            <p className="mt-1 text-sm leading-5 tracking-[-0.1504px] text-[#666]">
              {item.summary}
            </p>
          </div>
        </div>
        <div className="mt-[10px] ml-[60px] flex items-center gap-3 text-xs leading-4">
          <span className="text-[#666]">{item.date}</span>
          <span className="text-black">•</span>
          <span className="font-semibold text-primary">{item.remaining}</span>
        </div>
      </CardContent>
    </Card>
  );
}
