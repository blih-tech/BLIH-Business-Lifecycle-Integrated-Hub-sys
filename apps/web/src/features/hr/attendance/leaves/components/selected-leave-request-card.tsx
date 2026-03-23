'use client';

import { Clock3, FileText } from 'lucide-react';

import type { PreviousLeaveRow } from '@/features/hr/attendance/leaves/types';
import { Button } from '@/shared/components/ui/button';

type SelectedLeaveRequestCardProps = {
  request: PreviousLeaveRow;
};

function DeptBadge({ label }: { label: 'TECHNICAL DEPT.' | 'CREATIVE DEPT.' }) {
  return (
    <span className="rounded-[4px] bg-[rgba(30,102,247,0.1)] px-1.5 py-0.5 text-[9px] font-semibold uppercase text-primary">
      {label}
    </span>
  );
}

export function SelectedLeaveRequestCard({
  request,
}: SelectedLeaveRequestCardProps) {
  return (
    <aside className="rounded-[12px] border border-border bg-card p-4">
      <div className="space-y-4">
        <div className="flex items-start gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-[#404040] text-sm font-semibold text-white">
            {request.initials}
          </div>
          <div>
            <p className="text-sm font-medium text-black">{request.name}</p>
            <p className="text-xs text-[#666]">{request.role}</p>
            <p className="text-xs text-[#666]">{request.email}</p>
            <p className="text-xs text-[#666]">{request.phone}</p>
          </div>
          <DeptBadge label="TECHNICAL DEPT." />
        </div>

        <div className="rounded-[8px] bg-[#f5f5f5] p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-base font-semibold text-black">Leave Details</p>
            <span className="rounded-[4px] border border-primary px-2 py-0.5 text-[10px] font-medium text-primary">
              Sick
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <Info label="From" value={request.from} />
            <Info label="To" value={request.to} />
            <Info
              label="Duration"
              value={request.duration}
              valueClass="text-primary text-base font-semibold"
            />
            <div>
              <p className="text-[12px] text-[#666]">Submitted</p>
              <p className="mt-0.5 inline-flex items-center gap-1 text-[12px] font-semibold text-black">
                <Clock3 className="h-3 w-3 text-primary" />
                {request.submittedTime}
              </p>
              <p className="text-[12px] font-semibold text-black">
                {request.submittedDate}
              </p>
            </div>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-black">Reason for Leave</p>
          <p className="mt-1 text-xs text-[#666]">{request.reason}</p>
        </div>

        <div>
          <p className="text-sm font-medium text-black">Approved By</p>
          <div className="mt-2 space-y-2">
            {request.approvedBy.map((person, idx) => (
              <div
                key={`${person.name}-${idx}`}
                className="flex items-center gap-2"
              >
                <div className="grid h-7 w-7 place-items-center rounded-full bg-primary text-[10px] font-semibold text-white">
                  {person.initials}
                </div>
                <div>
                  <p className="text-xs font-medium text-black">
                    {person.name}
                  </p>
                  <p className="text-[10px] text-[#666]">{person.role}</p>
                </div>
                <DeptBadge label={person.deptLabel} />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[8px] bg-[#f5f5f5] p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-black">
              Attached Documents
            </p>
            <span className="rounded-[4px] border border-primary px-2 py-0.5 text-[10px] font-medium text-primary">
              {request.documents.length} Files
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {request.documents.map((doc) => (
              <div
                key={doc}
                className="flex h-8 items-center gap-2 rounded-[4px] border border-border bg-white px-2"
              >
                <FileText className="h-4 w-4 text-primary" />
                <p className="truncate text-xs text-black">{doc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button className="h-8 rounded-[4px] text-[11px]">
            View Profile
          </Button>
          <Button
            variant="outline"
            className="h-8 rounded-[4px] border-border bg-[#f3f3f3] text-[11px] text-black"
          >
            Download Files
          </Button>
        </div>
      </div>
    </aside>
  );
}

function Info({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div>
      <p className="text-[12px] text-[#666]">{label}</p>
      <p className={valueClass ?? 'text-[12px] font-semibold text-black'}>
        {value}
      </p>
    </div>
  );
}
