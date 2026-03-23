import type { ReactNode } from 'react';
import { Eye } from 'lucide-react';

import type { DisciplineActionCase } from '@/features/hr/talent/discipline/types';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/shared/components/ui/sheet';
import { cn } from '@/shared/lib/utils';

type DisciplineActionCaseCardProps = {
  item: DisciplineActionCase;
};

export function DisciplineActionCaseCard({
  item,
}: DisciplineActionCaseCardProps) {
  return (
    <Sheet>
      <Card className="gap-0 rounded-[10px] border-border py-0 shadow-none">
        <CardContent className="space-y-3 p-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'grid h-8 w-8 place-items-center rounded-full text-[10px] font-semibold text-white',
                  item.priority === 'high' ? 'bg-[#e7000b]' : 'bg-primary',
                )}
              >
                {item.initials}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-semibold text-black">
                    {item.name}
                  </p>
                  <span className="rounded-[4px] border border-border px-1.5 py-0.5 text-[9px] text-black">
                    {item.department}
                  </span>
                </div>
                <p className="text-xs text-[#666]">
                  Issue Date: {item.issueDate}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[4px] bg-[#f3f3f3] p-2">
            <div className="mb-1 flex items-center justify-between">
              <p
                className={cn(
                  'text-xs font-semibold',
                  item.priority === 'high' ? 'text-[#e7000b]' : 'text-primary',
                )}
              >
                {item.issueTitle}
              </p>
              <span
                className={cn(
                  'rounded-[4px] px-1.5 py-0.5 text-[9px] font-medium text-white',
                  item.priority === 'high' ? 'bg-[#e7000b]' : 'bg-primary',
                )}
              >
                {item.priority}
              </span>
            </div>
            <p className="text-xs text-[#666]">{item.description}</p>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-[#666]">Discipline Score</p>
            <p className="text-[24px] font-semibold leading-6 tracking-[-0.3125px] text-black">
              {item.score}
            </p>
          </div>

          <SheetTrigger asChild>
            <Button className="h-8 w-full rounded-[6px] bg-[#e7000b] text-xs text-white hover:bg-[#c50009]">
              <Eye className="h-3.5 w-3.5" />
              Review Case
            </Button>
          </SheetTrigger>
        </CardContent>
      </Card>

      <SheetContent
        side="right"
        className="w-[465px] max-w-[96vw] gap-0 p-0 sm:max-w-[465px]"
      >
        <SheetHeader className="border-b border-border px-6 py-6">
          <SheetTitle className="text-base font-normal tracking-[-0.3125px] text-black">
            Discipline Review
          </SheetTitle>
          <SheetDescription className="sr-only">
            Discipline case details and review information.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 overflow-y-auto px-6 py-6">
          <div className="flex items-center gap-3 rounded-[8px] bg-[#f3f3f3] p-4">
            <div
              className={cn(
                'grid h-16 w-16 place-items-center rounded-full text-xl font-semibold text-white',
                item.priority === 'high' ? 'bg-[#e7000b]' : 'bg-primary',
              )}
            >
              {item.initials}
            </div>
            <div>
              <p className="text-base font-semibold tracking-[-0.3125px] text-black">
                {item.name}
              </p>
              <p className="text-xs text-[#666]">{item.department}</p>
            </div>
          </div>

          <div className="rounded-[8px] bg-[#fef2f2] py-4 text-center">
            <p className="text-xs text-[#666]">Discipline Score</p>
            <p className="text-4xl font-bold leading-[1.1] text-primary">
              {item.score.split('/')[0]}
            </p>
            <p className="text-xs text-[#666]">out of 10</p>
          </div>

          <section className="space-y-3">
            <p className="text-sm font-semibold tracking-[-0.176px] text-black">
              Issue Details
            </p>
            <DetailRow label="Type" value={item.issueTitle} />
            <DetailRow
              label="Severity"
              value={
                <span
                  className={cn(
                    'rounded-[6px] px-2 py-0.5 text-xs font-medium text-white',
                    item.priority === 'high' ? 'bg-[#e7000b]' : 'bg-primary',
                  )}
                >
                  {item.priority}
                </span>
              }
            />
            <DetailRow label="Issue Date" value={item.issueDate} />
            <DetailRow
              label="Status"
              value={
                <span className="rounded-[6px] border border-border px-2 py-0.5 text-xs text-black">
                  under-review
                </span>
              }
            />
            <div className="rounded-[8px] bg-[#f3f3f3] p-3">
              <p className="text-xs font-medium text-black">Description</p>
              <p className="text-xs text-[#666]">{item.description}</p>
            </div>
          </section>

          <section className="space-y-3">
            <p className="text-sm font-semibold tracking-[-0.176px] text-black">
              Review Information
            </p>
            <InfoBlock label="Total Incidents" value="5" />
            <InfoBlock label="Previous Warnings" value="2" />
            <InfoBlock
              label="Manager Notes"
              value="Employee has shown improvement in recent weeks but pattern needs addressing"
            />
            <InfoBlock
              label="Action Taken"
              value="Formal written warning issued"
            />
            <InfoBlock label="Follow-up Date" value="2024-03-15" />
          </section>
        </div>

        <div className="mt-auto space-y-2 border-t border-border px-6 py-4">
          <Button className="h-9 w-full rounded-[6px] text-xs">
            View Employee Profile
          </Button>
          <Button
            variant="outline"
            className="h-9 w-full rounded-[6px] border-border bg-white text-xs text-black"
          >
            Download Report
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-xs text-[#666]">{label}:</p>
      <div className="text-xs font-medium text-black">{value}</div>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] bg-[#f3f3f3] p-3">
      <p className="text-xs text-[#666]">{label}</p>
      <p className="text-sm font-semibold text-black">{value}</p>
    </div>
  );
}
