'use client';

import { FileText, Mail, Sparkles } from 'lucide-react';

import type { ArchiveEmployee } from '@/features/hr/people/archive/types';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';

type SelectedArchiveCardProps = {
  employee: ArchiveEmployee;
};

export function SelectedArchiveCard({ employee }: SelectedArchiveCardProps) {
  return (
    <aside className="flex h-[800px] flex-col justify-between rounded-[12px] border border-border bg-card p-4">
      <div className="space-y-4">
        <div className="flex items-start gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-[#404040] text-sm font-semibold text-white">
            {employee.initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-base font-medium text-foreground">{employee.name}</p>
                <p className="text-sm text-muted-foreground">{employee.role}</p>
              </div>
              <span className="rounded-[4px] bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                {employee.technicalDepartmentLabel}
              </span>
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">{employee.email}</p>
            <p className="text-sm text-muted-foreground">{employee.phone}</p>
          </div>
        </div>

        <div className="rounded-[8px] bg-muted p-4">
          <h3 className="mb-4 text-base font-semibold leading-6 tracking-[-0.1504px] text-foreground">
            Employment
          </h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            <Info label="Start Date" value={employee.startDate} />
            <Info label="Total Tenure" value={employee.totalTenure} />
            <Info label="End Date" value={employee.endDate} />
            <Info label="Salary" value={employee.salary} />
          </div>
        </div>

        <div className="rounded-[8px] bg-muted p-4">
          <h3 className="mb-4 text-base font-semibold tracking-[-0.3125px] text-foreground">
            Offboarding Details
          </h3>

          <div className="mb-4 flex h-11 items-center gap-2 rounded-[8px] bg-primary/10 px-3">
            <Mail className="h-[18px] w-[18px] text-primary" />
            <p className="text-sm text-foreground">
              Resignation letter sent on:{' '}
              <span className="font-semibold">{employee.resignationDate}</span>
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <p className="mb-1 text-xs text-muted-foreground">Reason for Leaving</p>
              <p className="text-sm font-medium text-foreground">{employee.leavingReason}</p>
            </div>

            <div className="flex items-end gap-4">
              <div>
                <p className="mb-1 text-xs text-muted-foreground">Exit & Clearance</p>
                <Badge className="h-[22px] rounded-[4px] bg-primary px-3 text-xs text-white">
                  {employee.clearanceStatus}
                </Badge>
              </div>
              <div className="flex flex-1 items-center justify-between rounded-[8px] border border-primary bg-primary/10 px-4 py-2">
                <p className="text-sm font-semibold text-foreground">Avg. Score</p>
                <p className="relative text-2xl font-bold leading-7 text-primary">
                  <Sparkles className="absolute -left-5 top-[-4px] h-4 w-4 text-[#ffe345]" />
                  {employee.avgScore}%
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[8px] bg-muted p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold tracking-[-0.3125px] text-foreground">
              Archived Documents
            </h3>
            <Badge
              variant="outline"
              className="h-[22px] rounded-[6px] border-primary px-2 text-xs text-primary"
            >
              {employee.archivedFiles} files
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {employee.documents.map((doc) => (
              <div
                key={doc}
                className="flex h-8 items-center gap-2 rounded-[4px] border border-border bg-card px-[9px]"
              >
                <FileText className="h-4 w-4 text-primary" />
                <p className="truncate text-sm text-foreground">{doc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Button className="h-8 flex-1 rounded-[4px] text-xs font-medium">View Record</Button>
        <Button
          variant="outline"
          className="h-8 flex-1 rounded-[4px] border-border bg-muted text-xs font-medium text-foreground"
        >
          Download Files
        </Button>
      </div>
    </aside>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium tracking-[-0.1504px] text-foreground">
        {value}
      </p>
    </div>
  );
}
