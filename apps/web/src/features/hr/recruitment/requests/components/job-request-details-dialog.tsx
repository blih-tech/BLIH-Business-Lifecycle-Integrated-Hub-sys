'use client';

import { ChevronUp, Clock, Pencil } from 'lucide-react';
import { useState } from 'react';

import type {
  FullJobRequest,
  JobRequestDepartment,
} from '@/features/hr/recruitment/requests/types';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';

type JobRequestDetailsVariant = 'active' | 'by_me' | 'closed' | 'posted';

type JobRequestDetailsDialogProps = {
  request: FullJobRequest | null;
  currentUserName: string;
  variant?: JobRequestDetailsVariant;
  onOpenChange: (isOpen: boolean) => void;
  onApprove: () => void;
  onJustify: () => void;
  onEdit?: () => void;
};

type EmployeeCardProps = {
  name: string;
  role?: string;
  department?: string;
  variant?: 'stacked' | 'inline';
};

type BulletListProps = {
  items?: string[] | null;
};

type InfoBlockProps = {
  label: string;
  value: string;
  valueBadge?: boolean;
};

function formatRichText(value?: string | null) {
  const trimmedValue = value?.trim() ?? '';
  if (!trimmedValue) return '';
  if (/<[a-z][\s\S]*>/i.test(trimmedValue)) return trimmedValue;

  return trimmedValue
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, '<br />')}</p>`)
    .join('');
}

function departmentLabel(department: JobRequestDepartment) {
  if (department === 'technical') return 'TECHNICAL DEPT.';
  if (department === 'creative') return 'CREATIVE DEPT.';
  if (department === 'digital_marketing') return 'DIGITAL MARKETING DEPT.';
  return 'DEPARTMENT';
}

function employmentTypeLabel(
  value: FullJobRequest['jobDetailsForm']['employmentType'],
) {
  const normalized = value.toLowerCase();
  if (normalized === 'full_time') return 'Full-time';
  if (normalized === 'part_time') return 'Part-time';
  if (normalized === 'contract') return 'Contract';
  if (normalized === 'temporary') return 'Temporary';
  return 'Intern';
}

function urgencyLabel(value: FullJobRequest['requestForm']['urgency']) {
  const normalized = value.toLowerCase();
  if (normalized === 'high') return 'High';
  if (normalized === 'medium') return 'Medium';
  return 'Low';
}

function formatValue(value: string) {
  return value
    .split('_')
    .map((part) => (part ? part[0]!.toUpperCase() + part.slice(1) : part))
    .join(' ');
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const initials = parts.slice(0, 2).map((part) => part[0]!.toUpperCase());
  return initials.join('') || '--';
}

function formatPositions(openings?: string) {
  if (!openings) return '1 Position';
  const numeric = Number(openings);
  if (Number.isNaN(numeric) || numeric <= 0) return openings;
  return `${numeric} Position${numeric === 1 ? '' : 's'}`;
}

function EmployeeCard({
  name,
  role,
  department,
  variant = 'inline',
}: EmployeeCardProps) {
  return (
    <div
      className={`flex items-center gap-2 ${variant === 'stacked' ? 'items-start' : ''}`}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1e66f7] text-sm font-semibold text-white">
        {getInitials(name)}
      </div>
      <div
        className={
          variant === 'stacked' ? 'space-y-1' : 'flex items-center gap-2'
        }
      >
        <div className={variant === 'stacked' ? 'space-y-0.5' : ''}>
          <p className="text-sm font-semibold tracking-[-0.2px] text-black">
            {name}
          </p>
          {role ? <p className="text-[12px] text-[#666]">{role}</p> : null}
        </div>
        {department ? (
          <Badge
            variant="secondary"
            className="rounded-[4px] bg-[#e9f0fe] px-1.5 py-0.5 text-[12px] font-semibold uppercase text-[#1e66f7]"
          >
            {department}
          </Badge>
        ) : null}
      </div>
    </div>
  );
}

function BulletList({ items }: BulletListProps) {
  if (!items || items.length === 0) {
    return <p className="text-sm text-[#666]">No details provided.</p>;
  }

  return (
    <ul className="space-y-1">
      {items.map((item) => (
        <li
          key={item}
          className="relative pl-4 text-sm text-[#666] before:absolute before:left-0 before:text-[#1e66f7] before:content-['•']"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

function InfoBlock({ label, value, valueBadge }: InfoBlockProps) {
  return (
    <div className="space-y-1">
      <p className="text-[12px] text-[#666]">{label}</p>
      {valueBadge ? (
        <Badge
          variant="outline"
          className="rounded-[6px] border-[#1e66f7] px-2 py-0.5 text-[12px] font-medium text-[#1e66f7]"
        >
          {value}
        </Badge>
      ) : (
        <p className="text-sm tracking-[-0.2px] text-black">{value}</p>
      )}
    </div>
  );
}

export function JobRequestDetailsDialog({
  request,
  currentUserName,
  variant,
  onOpenChange,
  onApprove,
  onJustify,
  onEdit,
}: JobRequestDetailsDialogProps) {
  const dialogVariant = variant ?? 'active';
  const ownRequest = request
    ? request.requestForm.requestedBy.trim().toLowerCase() ===
      currentUserName.trim().toLowerCase()
    : false;

  const [isCommitteeOpen, setIsCommitteeOpen] = useState(true);
  const [isApprovedOpen, setIsApprovedOpen] = useState(true);

  const hiringCommittee = [
    {
      name: request?.requestForm.requestedBy ?? 'Request Owner',
      role: request ? formatValue(request.requestForm.position) : 'Hiring Lead',
      department: request
        ? departmentLabel(request.requestForm.department as JobRequestDepartment)
        : 'DEPARTMENT',
    },
    {
      name: 'HR Partner',
      role: 'HR Business Partner',
      department: request
        ? departmentLabel(request.requestForm.department as JobRequestDepartment)
        : 'DEPARTMENT',
    },
  ];

  const approvedBy = [
    {
      name: 'GM Approver',
      role: 'General Manager',
      department: request
        ? departmentLabel(request.requestForm.department as JobRequestDepartment)
        : 'DEPARTMENT',
    },
    {
      name: 'Finance Approver',
      role: 'Finance Lead',
      department: request
        ? departmentLabel(request.requestForm.department as JobRequestDepartment)
        : 'DEPARTMENT',
    },
  ];

  return (
    <Dialog open={request !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] w-[96vw] overflow-y-auto rounded-[24px] border border-[#e5e5e5] bg-white p-0 sm:max-w-[920px] [&::-webkit-scrollbar]:w-0 [scrollbar-width:none]">
        {request ? (
          <>
            <DialogHeader className="p-6">
              <div className="flex w-full flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1 space-y-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <DialogTitle className="text-[18px] font-semibold tracking-[-0.4px] text-black">
                      {request.requestForm.jobTitle || request.jobDetailsForm.title}
                    </DialogTitle>
                    <Badge
                      variant="outline"
                      className="rounded-[4px] border-[#1e66f7] px-2 py-0.5 text-[12px] font-medium text-[#1e66f7]"
                    >
                      {formatValue(request.jobDetailsForm.experienceLevel)}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-6 text-sm text-[#666]">
                    <Badge
                      variant="secondary"
                      className="rounded-[4px] bg-[#e9f0fe] px-1.5 py-0.5 text-[12px] font-semibold uppercase text-[#1e66f7]"
                    >
                      {departmentLabel(
                        request.requestForm.department as JobRequestDepartment,
                      )}
                    </Badge>
                    <span>
                      {employmentTypeLabel(
                        request.jobDetailsForm.employmentType,
                      )}
                    </span>
                    <span>{formatPositions(request.requestForm.openings)}</span>
                  </div>
                </div>
                {dialogVariant === 'by_me' ? (
                  <div className="ml-auto flex items-center gap-2 rounded-[8px] bg-[#e9f0fe] px-3 py-2">
                    <Clock className="h-4 w-4 text-[#1e66f7]" />
                    <span className="text-sm tracking-[-0.2px] text-black">
                      Waiting other approvals
                    </span>
                  </div>
                ) : null}
                {dialogVariant === 'closed' ? (
                  <div className="flex h-[22px] items-center rounded-[4px] bg-black px-2 py-0.5">
                    <span className="text-[12px] font-medium text-white">
                      Declined
                    </span>
                  </div>
                ) : null}
              </div>
            </DialogHeader>

            <div className="border-t border-[#e5e5e5]" />

            <div className="grid gap-6 p-6">
              <section className="rounded-[8px] bg-[#f3f3f3] p-4">
                <p className="text-sm font-semibold tracking-[-0.4px] text-black">
                  Job Request Details
                </p>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <div className="space-y-4">
                    <InfoBlock
                      label="Priority"
                      value={urgencyLabel(request.requestForm.urgency)}
                      valueBadge
                    />
                    <InfoBlock
                      label="Date Requested"
                      value={request.requestForm.createdDate || 'Not set'}
                    />
                  </div>
                  <div className="space-y-4">
                    <InfoBlock
                      label="Due Date"
                      value={request.requestForm.neededByDate}
                    />
                    <InfoBlock
                      label="Expected Date"
                      value={request.requestForm.neededByDate}
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-[12px] text-[#666]">Requested By</p>
                    <EmployeeCard
                      name={request.requestForm.requestedBy}
                      role={formatValue(request.requestForm.position)}
                      department={departmentLabel(
                        request.requestForm.department as JobRequestDepartment,
                      )}
                      variant="stacked"
                    />
                  </div>
                </div>
              </section>

              <section className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold tracking-[-0.4px] text-black">
                      Job Overview
                    </p>
                    <DialogDescription className="text-sm leading-5 text-[#666]">
                      <span
                        dangerouslySetInnerHTML={{
                          __html: formatRichText(
                            request.jobDetailsForm.description,
                          ),
                        }}
                      />
                    </DialogDescription>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold tracking-[-0.4px] text-black">
                      Requirements
                    </p>
                    <BulletList
                      items={request.jobDetailsForm.requiredSkills
                        .split('\n')
                        .map((item) => item.trim())
                        .filter(Boolean)}
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold tracking-[-0.4px] text-black">
                      Preferred Skills
                    </p>
                    <BulletList
                      items={request.jobDetailsForm.preferredSkills
                        .split('\n')
                        .map((item) => item.trim())
                        .filter(Boolean)}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold tracking-[-0.4px] text-black">
                      Responsibilities
                    </p>
                    <BulletList
                      items={request.jobDetailsForm.responsibilities
                        .split('\n')
                        .map((item) => item.trim())
                        .filter(Boolean)}
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold tracking-[-0.4px] text-black">
                      Importance of this Hire
                    </p>
                    <p className="text-sm leading-5 text-[#666]">
                      {request.requestForm.businessJustification}
                    </p>
                  </div>
                </div>
              </section>

              <section className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-4">
                  <button
                    type="button"
                    className="flex w-full cursor-pointer items-center justify-between rounded-[8px] bg-[#e9f0fe] px-3 py-2"
                    onClick={() => setIsCommitteeOpen((prev) => !prev)}
                  >
                    <p className="text-sm font-semibold tracking-[-0.4px] text-black">
                      Hiring Committee
                    </p>
                    <ChevronUp
                      className={`h-4 w-4 text-[#1e66f7] ${isCommitteeOpen ? '' : 'rotate-180'}`}
                    />
                  </button>
                  {isCommitteeOpen ? (
                    <div className="space-y-3">
                      {hiringCommittee.map((member) => (
                        <EmployeeCard
                          key={member.name}
                          name={member.name}
                          role={member.role}
                          department={member.department}
                        />
                      ))}
                    </div>
                  ) : null}
                </div>
                <div className="space-y-4">
                  <button
                    type="button"
                    className="flex w-full cursor-pointer items-center justify-between rounded-[8px] bg-[#e9f0fe] px-3 py-2"
                    onClick={() => setIsApprovedOpen((prev) => !prev)}
                  >
                    <p className="text-sm font-semibold tracking-[-0.4px] text-black">
                      Approved By
                    </p>
                    <ChevronUp
                      className={`h-4 w-4 text-[#1e66f7] ${isApprovedOpen ? '' : 'rotate-180'}`}
                    />
                  </button>
                  {isApprovedOpen ? (
                    <div className="space-y-3">
                      {approvedBy.map((member) => (
                        <div key={member.name} className="space-y-1">
                          <EmployeeCard
                            name={member.name}
                            role={member.role}
                            department={member.department}
                          />
                          <div className="flex items-center gap-2 pl-11 text-[12px] text-[#666]">
                            <Clock className="h-3.5 w-3.5 text-[#1e66f7]" />
                            <span>02:33 PM · Dec 30, 2025</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </section>
            </div>

            <DialogFooter className="gap-3 border-t border-[#e5e5e5] p-6">
              {dialogVariant === 'active' ? (
                ownRequest ? (
                  <div className="w-full rounded-[8px] border border-[#e5e5e5] bg-[#f3f3f3] px-4 py-3 text-sm text-[#666]">
                    Waiting for other reviewers to make a decision on this
                    request.
                  </div>
                ) : (
                  <div className="grid w-full gap-3 md:grid-cols-3">
                    <Button
                      type="button"
                      className="h-9 w-full rounded-[6px] bg-[#1e66f7] text-sm text-white hover:bg-[#1b5ce0]"
                      onClick={onApprove}
                    >
                      Approve
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-9 w-full rounded-[6px] border-[#e5e5e5] text-sm text-black hover:bg-[#f5f5f5]"
                      onClick={onJustify}
                    >
                      Justify
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-9 w-full rounded-[6px] border-[#e5e5e5] text-sm text-black hover:bg-[#f5f5f5]"
                      onClick={onEdit}
                      disabled={!onEdit}
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>
                  </div>
                )
              ) : null}
              {dialogVariant === 'by_me' ? (
                <div className="grid w-full gap-3 md:grid-cols-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-9 w-full rounded-[6px] border-[#ff3b30] text-sm text-[#ff3b30] hover:bg-[#fff1f0]"
                  >
                    Terminate
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-9 w-full rounded-[6px] border-[#e5e5e5] text-sm text-black hover:bg-[#f5f5f5]"
                    onClick={onEdit}
                    disabled={!onEdit}
                  >
                    <Pencil className="h-4 w-4" />
                    Edit Job
                  </Button>
                </div>
              ) : null}
              {dialogVariant === 'closed' ? (
                <div className="grid w-full gap-3 md:grid-cols-2">
                  <Button
                    type="button"
                    className="h-9 w-full rounded-[6px] bg-[#1e66f7] text-sm text-white hover:bg-[#1b5ce0]"
                  >
                    Re-Request
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-9 w-full rounded-[6px] border-[#e5e5e5] text-sm text-black hover:bg-[#f5f5f5]"
                    onClick={onEdit}
                    disabled={!onEdit}
                  >
                    <Pencil className="h-4 w-4" />
                    Edit Job
                  </Button>
                </div>
              ) : null}
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
