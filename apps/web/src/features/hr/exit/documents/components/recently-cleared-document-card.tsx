import { Download } from 'lucide-react';

import type { RecentlyClearedItem } from '@/features/hr/exit/documents/types';
import { Button } from '@/shared/components/ui/button';

type RecentlyClearedDocumentCardProps = {
  item: RecentlyClearedItem;
};

export function RecentlyClearedDocumentCard({
  item,
}: RecentlyClearedDocumentCardProps) {
  return (
    <div className="flex items-center justify-between rounded-[8px] bg-[#f3f3f3] p-[10px]">
      <div className="flex items-start gap-2">
        <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-sm font-semibold text-white">
          {item.initials}
        </div>
        <div>
          <p className="text-base font-semibold tracking-[-0.3125px] text-black">
            {item.name}
          </p>
          <p className="text-sm text-[#666]">Cleared by {item.clearedBy}</p>
          <p className="text-sm text-[#666]">{item.date}</p>
        </div>
      </div>
      <Button
        variant="outline"
        className="h-16 w-[124px] flex-col gap-1 rounded-[6px] border-border bg-white text-[#666]"
      >
        <span className="text-xs">Cleared Files</span>
        <Download className="h-3.5 w-3.5 text-black" />
      </Button>
    </div>
  );
}
