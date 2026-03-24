import { Download } from 'lucide-react';

import type { EmployeeClearanceItem } from '@/features/hr/exit/documents/types';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';

import { ClearanceProgressWidget } from './clearance-progress-widget';

type EmployeeClearanceCardProps = {
  item: EmployeeClearanceItem;
};

export function EmployeeClearanceCard({ item }: EmployeeClearanceCardProps) {
  const firstRow = item.documents.slice(0, 5);
  const secondRow = item.documents.slice(5, 10);

  return (
    <Card className="gap-0 rounded-[12px] border-border py-0 shadow-none">
      <CardContent className="space-y-3 p-4">
        <div className="grid gap-3 xl:grid-cols-[1fr_124px]">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-primary text-sm font-semibold text-white">
                {item.initials}
              </div>
              <div>
                <p className="text-base font-semibold tracking-[-0.3125px] text-black">
                  {item.name}
                </p>
                <p className="text-sm text-[#666]">{item.role}</p>
              </div>
              <span className="ml-2 inline-flex h-4 items-center rounded-[4px] bg-[#dbe6fb] px-1 text-[10px] font-semibold uppercase text-primary">
                {item.department}
              </span>
            </div>
            <p className="text-sm text-[#666]">
              Last Working Day: {item.lastWorkingDay}
            </p>
            <div className="space-y-2 border-t border-[#e5e5e5] pt-3">
              <DocumentsRow items={firstRow} />
              <DocumentsRow items={secondRow} />
            </div>
          </div>
          <ClearanceProgressWidget
            progressText={item.progressText}
            progressTasks={item.progressTasks}
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button size="sm" className="h-8 rounded-[6px] px-4 text-xs">
            Manage Documents
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 rounded-[6px] border-border bg-white text-xs text-black"
          >
            Download All
            <Download className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function DocumentsRow({ items }: { items: { id: string; label: string }[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <div
          key={item.id}
          className="inline-flex h-5 items-center rounded-[6px] bg-[#dbe6fb] px-2 text-xs text-black"
        >
          <span className="mr-1 text-primary">◉</span>
          {item.label}
        </div>
      ))}
    </div>
  );
}
