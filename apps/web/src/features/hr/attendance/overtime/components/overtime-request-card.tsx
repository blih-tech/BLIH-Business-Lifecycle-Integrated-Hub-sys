import { Clock3 } from 'lucide-react';

import type { OvertimeRequestCardItem } from '@/features/hr/attendance/overtime/types';
import { Button } from '@/shared/components/ui/button';

type OvertimeRequestCardProps = {
  request: OvertimeRequestCardItem;
};

export function OvertimeRequestCard({ request }: OvertimeRequestCardProps) {
  return (
    <article className="rounded-[12px] border border-border bg-white p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-primary text-xs font-semibold text-white">
            {request.employeeInitials}
          </div>
          <div>
            <p className="text-sm font-medium text-black">
              {request.employeeName}
            </p>
            <p className="text-xs text-[#666]">{request.role}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-[8px] bg-[#f3f3f3] p-4">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <Info label="From" value={request.from} />
          <Info label="To" value={request.to} />
          <Info
            label="Total Hours"
            value={request.totalHours}
            valueClass="text-primary text-base font-semibold"
          />
          <div>
            <p className="text-[12px] text-[#666]">Submitted</p>
            <p className="mt-0.5 inline-flex items-center gap-1 text-[12px] font-semibold text-black">
              <Clock3 className="h-3 w-3 text-primary" />
              {request.submittedTime} {request.submittedDate}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-sm font-medium text-black">{request.reason}</p>
        <p className="mt-1 text-xs text-[#666]">
          {request.status === 'accepted'
            ? 'Need focused time to complete Q1 marketing strategy without office distractions. All meetings can be attended remotely.'
            : 'Multiple virtual client meetings scheduled. More efficient to work from home office with better video setup.'}
        </p>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button className="h-7 rounded-[4px] text-[11px]">Accept</Button>
        <Button
          variant="outline"
          className="h-7 rounded-[4px] border-border bg-[#f3f3f3] text-[11px] text-black"
        >
          Reject
        </Button>
      </div>
    </article>
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
