import type { ExitResignRequestItem } from '@/features/hr/exit/resign/types';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { cn } from '@/shared/lib/utils';

import { ResignMetaField } from './resign-meta-field';

type ResignationRequestCardProps = {
  item: ExitResignRequestItem;
};

export function ResignationRequestCard({ item }: ResignationRequestCardProps) {
  return (
    <Card className="gap-0 rounded-[10px] border-border py-0 shadow-none">
      <CardContent className="space-y-4 p-4">
        <div className="grid gap-4 xl:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-primary text-base font-semibold tracking-[-0.3125px] text-white">
                {item.initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-base font-semibold tracking-[-0.3125px] text-black">
                    {item.name}
                  </p>
                  <span className="inline-flex h-[22px] items-center rounded-[6px] border border-[#e5e5e5] px-[9px] text-xs font-medium text-black">
                    {item.department}
                  </span>
                  <span
                    className={cn(
                      'ml-auto inline-flex h-[22px] items-center rounded-[6px] px-[9px] text-xs font-medium text-white',
                      item.status === 'approved'
                        ? 'bg-[#00a63e]'
                        : 'bg-[#c98000]',
                    )}
                  >
                    {item.status}
                  </span>
                </div>
                <p className="text-sm leading-5 tracking-[-0.1504px] text-[#666]">
                  {item.role}
                </p>
              </div>
            </div>
            <div className="space-y-3 pl-[47px]">
              <div className="grid gap-3 sm:grid-cols-2">
                <ResignMetaField field={item.meta[0]} />
                <ResignMetaField field={item.meta[1]} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <ResignMetaField field={item.meta[2]} />
                <ResignMetaField field={item.meta[3]} />
              </div>
            </div>
          </div>

          <div className="space-y-7">
            <div className="h-[212px] rounded-[8px] bg-[#f3f3f3] p-4">
              <p className="text-sm font-semibold tracking-[-0.1504px] text-black">
                {item.letterTitle}
              </p>
              <div className="mt-3 h-[152px] overflow-hidden rounded-[4px] border border-[#e5e5e5] bg-white px-[17px] pb-1 pt-[17px]">
                <p className="whitespace-pre-wrap text-sm leading-5 tracking-[-0.1504px] text-[rgba(0,0,0,0.7)]">
                  {item.letterBody}
                </p>
              </div>
            </div>
            <div className="grid h-9 grid-cols-2 gap-2">
              <Button size="sm" className="h-9 rounded-[6px] text-xs">
                Approve &amp; Respond
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-9 rounded-[6px] border-border bg-white text-xs text-black"
              >
                Request Revision
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
