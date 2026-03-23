import { Download, FileText, Pencil, Trash2 } from 'lucide-react';

import type { ExitInterviewFormItem } from '@/features/hr/exit/related-forms/types';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';

type InterviewFormCardProps = {
  item: ExitInterviewFormItem;
};

export function InterviewFormCard({ item }: InterviewFormCardProps) {
  const firstRow = item.fields.slice(0, 4);
  const secondRow = item.fields.slice(4, 8);

  return (
    <Card className="gap-0 rounded-[12px] border-0 bg-white py-0 shadow-none">
      <CardContent className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-[8px] bg-[rgba(30,102,247,0.1)]">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[18px] font-semibold leading-7 tracking-[-0.4395px] text-black">
                  {item.title}
                </p>
                <span className="inline-flex h-[22px] items-center rounded-[6px] bg-primary px-[9px] text-xs font-medium leading-4 text-white">
                  {item.category}
                </span>
                <span className="inline-flex h-[22px] items-center rounded-[6px] border border-[#e5e5e5] px-[9px] text-xs font-medium leading-4 text-black">
                  {item.version}
                </span>
              </div>
              <p className="text-sm leading-5 tracking-[-0.1504px] text-[#666]">
                {item.description}
              </p>
              <p className="text-xs leading-4 text-[#666]">
                Updated: {item.updatedAt}
                <span className="mx-4">•</span>
                Used {item.usedCount} times
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-8 rounded-[6px] border-[#e5e5e5] bg-white px-[10px] text-sm text-black hover:bg-white"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
        </div>

        <div className="rounded-[8px] bg-[#f3f3f3] px-[57px] py-[9px]">
          <p className="mb-4 text-sm font-semibold leading-5 tracking-[-0.1504px] text-black">
            Form Fields:
          </p>
          <div className="space-y-2">
            <ChipRow items={firstRow} />
            <ChipRow items={secondRow} />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8 rounded-[6px] border-[#e5e5e5] bg-white px-[8px] text-sm text-black hover:bg-white"
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 rounded-[6px] border-[#e5e5e5] bg-white px-[10px] text-sm text-[#e7000b] hover:bg-white hover:text-[#e7000b]"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ChipRow({ items }: { items: string[] }) {
  return (
    <div className="grid gap-2 md:grid-cols-4">
      {items.map((item) => (
        <span
          key={item}
          className="inline-flex h-[22px] items-center rounded-[6px] border border-[#e5e5e5] bg-white px-[9px] text-xs font-medium leading-4 text-black"
        >
          {item}
        </span>
      ))}
    </div>
  );
}
