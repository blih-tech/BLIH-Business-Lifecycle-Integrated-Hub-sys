import type {
  FullJobRequest,
  JobRequestDepartment,
  JobRequestPriority,
} from '@/features/hr/recruitment/requests/types';
import type { MouseEvent } from 'react';
import { Clock } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

type JobRequestCardProps = {
  item: FullJobRequest;
  priority: JobRequestPriority;
  onClick?: () => void;
  onJustifyClick?: () => void;
};

function departmentLabel(department: JobRequestDepartment) {
  if (department === 'technical') return 'TECHNICAL DEPT.';
  if (department === 'creative') return 'CREATIVE DEPT.';
  return 'DIGITAL MARKETING DEPT.';
}

function priorityLabel(priority: JobRequestPriority) {
  if (priority === 'high') return 'High';
  if (priority === 'medium') return 'Medium';
  return 'Low';
}

function priorityBadgeClasses(priority: JobRequestPriority) {
  if (priority === 'high') {
    return 'h-[22px] rounded-[6px] border border-[#1e66f7] px-[9px] py-[3px] text-[#1e66f7]';
  }
  if (priority === 'medium') {
    return 'h-[22px] rounded-[6px] border border-black px-[9px] py-[3px] text-black';
  }
  return 'h-[22px] rounded-[6px] bg-[#f3f3f3] px-[8px] py-[2px] text-[#666]';
}

function formatOpenings(value?: string) {
  if (!value?.trim()) return 'Not set';
  return value;
}

function formatEmploymentType(value?: string) {
  if (!value?.trim()) return 'Not set';
  if (value === 'full_time') return 'Full-time';
  if (value === 'part_time') return 'Part-time';
  if (value === 'contract') return 'Contract';
  if (value === 'intern') return 'Intern';
  return value.replace(/_/g, ' ');
}

function formatCreatedDate(value?: string) {
  if (!value?.trim()) return 'Not set';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(parsed);
}

export function JobRequestCard({
  item,
  priority,
  onClick,
  onJustifyClick,
}: JobRequestCardProps) {
  function handleActionClick(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
  }

  return (
    <article
      className="cursor-pointer rounded-[12px] border border-[#e5e5e5] bg-white p-[25px]"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick?.();
        }
      }}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="truncate text-[16px] font-semibold leading-[24px] tracking-[-0.4px] text-black">
            {item.jobDetailsForm.jobTitle}
          </p>
          <span className="mt-1 inline-flex rounded-[4px] bg-[#e9f0fe] px-[4px] py-[2px] text-[12px] font-semibold uppercase leading-[16px] text-[#1e66f7]">
            {departmentLabel(
              item.requestForm.department as JobRequestDepartment,
            )}
          </span>
        </div>
        <div className="flex items-center gap-[8px]">
          {item.status === 'closed' ? (
            <span className="inline-flex h-[22px] items-center justify-center rounded-[4px] bg-black px-[8px] py-[2px] text-[12px] font-medium leading-[16px] text-white">
              Declined
            </span>
          ) : (
            <span
              className={`inline-flex items-center justify-center text-[12px] font-medium leading-[16px] ${priorityBadgeClasses(
                priority,
              )}`}
            >
              {priorityLabel(priority)}
            </span>
          )}
        </div>
      </div>

      <div className="mt-[24px] flex items-end justify-between">
        <div className="flex flex-1 flex-col gap-[4px]">
          <div className="flex items-center gap-[4px] text-[14px] leading-[20px] tracking-[-0.2px]">
            <span className="text-[#666]">Positions:</span>
            <span className="font-medium text-black">
              {formatOpenings(item.requestForm.openings)}
            </span>
          </div>
          <div className="flex items-center gap-[4px] text-[14px] leading-[20px] tracking-[-0.2px]">
            <span className="text-[#666]">Type:</span>
            <span className="font-medium text-black">
              {formatEmploymentType(item.requestForm.employmentType)}
            </span>
          </div>
          <div className="flex items-center gap-[4px] text-[14px] leading-[20px] tracking-[-0.2px]">
            <span className="text-[#666]">Requested:</span>
            <span className="font-medium text-black">
              {formatCreatedDate(item.requestForm.createdDate)}
            </span>
          </div>
        </div>
        <div className="flex items-start gap-[8px]">
          {item.status === 'closed' ? null : item.status === 'by_me' ? (
            <div className="flex h-[32px] items-center gap-[8px] rounded-[8px] bg-[#e9f0fe] px-[12px]">
              <Clock className="h-[16px] w-[16px] text-[#1e66f7]" />
              <span className="text-[14px] leading-[20px] tracking-[-0.2px] text-black">
                Waiting other approvals
              </span>
            </div>
          ) : (
            <>
              <Button
                type="button"
                size="sm"
                className="h-[32px] w-[88px] rounded-[6px] bg-[#1e66f7] px-[16px] py-[6px] text-[14px] font-medium leading-[20px] tracking-[-0.2px] text-white hover:bg-[#1e66f7]"
                onClick={handleActionClick}
              >
                Approve
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-[32px] w-[77px] rounded-[6px] border border-[#e5e5e5] bg-white px-[16px] py-[6px] text-[14px] font-medium leading-[20px] tracking-[-0.2px] text-black shadow-none hover:bg-white hover:text-black"
                onClick={(event) => {
                  handleActionClick(event);
                  onJustifyClick?.();
                }}
              >
                Justify
              </Button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
