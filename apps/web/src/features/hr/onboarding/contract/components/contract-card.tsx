'use client';

import { ChevronDown, ChevronUp, Mail } from 'lucide-react';
import { useState } from 'react';

import type { EmploymentContract } from '@/features/hr/onboarding/contract/types';
import { Button } from '@/shared/components/ui/button';

type ContractStatus = 'TODO' | 'SUBMITTED' | 'CHANGES_REQUESTED' | 'COMPLETED';

type ContractCardProps = {
  contract: EmploymentContract & {
    taskId: string;
    status: ContractStatus;
  };
  defaultExpanded?: boolean;

  onSubmit?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
};

export function ContractCard({
  contract,
  defaultExpanded = false,
  onSubmit,
  onApprove,
  onReject,
}: ContractCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <article className="overflow-hidden rounded-[12px] border border-[#e5e5e5] bg-white">
      <div className="px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#1e66f7] text-base font-semibold text-white">
              {contract.avatarText}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-base font-medium text-black">
                  {contract.name}
                </p>
                <span className="inline-flex rounded-[4px] bg-[rgba(30,102,247,0.1)] px-1 py-0.5 text-xs font-semibold uppercase text-[#1e66f7]">
                  {contract.department}
                </span>
              </div>
              <p className="mt-1 text-sm text-[#666]">{contract.role}</p>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-auto gap-1 p-0 text-xs font-medium text-primary"
            onClick={() => setIsExpanded((p) => !p)}
          >
            {isExpanded ? <ChevronUp /> : <ChevronDown />}
            {isExpanded ? 'Less' : 'More'}
          </Button>
        </div>
      </div>

      <div className={isExpanded ? 'block' : 'hidden'}>
        <div className="border-t px-5 py-3.5">
          <div className="grid gap-4 lg:grid-cols-[1fr_0.48fr]">
            <section>
              <div className="flex h-11 items-center gap-2 bg-blue-50 px-3 rounded">
                <Mail className="text-primary" />
                <p className="text-sm">
                  Offer letter sent on{' '}
                  <span className="font-semibold">{contract.offerSentOn}</span>
                </p>
              </div>

              <h3 className="mt-5 font-semibold">Role Summary</h3>
              <p className="mt-2 text-sm text-gray-600">
                {contract.roleSummary}
              </p>

              <h4 className="mt-4 font-medium">Responsibilities</h4>
              <ul className="mt-2 space-y-1">
                {contract.responsibilities.map((item) => (
                  <li key={item} className="text-sm text-gray-600">
                    • {item}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <div className="bg-gray-100 p-4 rounded">
                <p className="font-medium">Overview</p>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Start Date</p>
                    <p className="font-semibold">
                      {contract.overview.startDate}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Probation</p>
                    <p className="font-semibold">
                      {contract.overview.probationPeriod}
                    </p>
                  </div>
                </div>
              </div>

              {/* ✅ ACTION BUTTONS */}
              <div className="mt-4 flex gap-2">
                {contract.status === 'TODO' && (
                  <Button onClick={onSubmit}>Sign Contract</Button>
                )}

                {contract.status === 'CHANGES_REQUESTED' && (
                  <Button onClick={onSubmit}>Resubmit</Button>
                )}

                {contract.status === 'SUBMITTED' && (
                  <>
                    <Button onClick={onApprove}>Approve</Button>
                    <Button variant="destructive" onClick={onReject}>
                      Reject
                    </Button>
                  </>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </article>
  );
}
