import type {
  ApprovalProgressState,
  FullJobRequest,
  JobRequestDepartment,
  JobRequestPriority,
} from "@/features/hr/recruitment/requests/types";
import type { MouseEvent } from "react";
import { Button } from "@/shared/components/ui/button";

type JobRequestCardProps = {
  item: FullJobRequest;
  priority: JobRequestPriority;
  onClick?: () => void;
  onJustifyClick?: () => void;
};

function departmentLabel(department: JobRequestDepartment) {
  if (department === "technical") return "TECHNICAL DEPT.";
  if (department === "creative") return "CREATIVE DEPT.";
  return "DIGITAL MARKETING DEPT.";
}

function priorityClasses(priority: JobRequestPriority) {
  if (priority === "high") return "bg-[rgba(30,102,247,0.1)] text-primary border border-transparent";
  if (priority === "medium") return "bg-[#f5f5f5] text-black border border-border";
  return "bg-[#f5f5f5] text-[#666] border border-transparent";
}

function priorityLabel(priority: JobRequestPriority) {
  if (priority === "high") return "High";
  if (priority === "medium") return "Medium";
  return "Low";
}

function employmentTypeLabel(value: FullJobRequest["jobDetailsForm"]["employmentType"]) {
  if (value === "full_time") return "Full-time";
  if (value === "part_time") return "Part-time";
  if (value === "contract") return "Contract";
  return "Intern";
}

function workModeLabel(value: FullJobRequest["jobDetailsForm"]["workMode"]) {
  if (value === "on_site") return "On-site";
  if (value === "hybrid") return "Hybrid";
  return "Remote";
}

function progressClasses(status: ApprovalProgressState) {
  if (status === "approved") return "bg-[rgba(22,163,74,0.08)] text-[rgb(22,101,52)]";
  if (status === "requested_review") return "bg-[rgba(217,119,6,0.12)] text-[rgb(146,64,14)]";
  if (status === "rejected") return "bg-[rgba(220,38,38,0.08)] text-[rgb(153,27,27)]";
  return "bg-muted text-muted-foreground";
}

function progressLabel(status: ApprovalProgressState) {
  if (status === "requested_review") return "Review";
  if (status === "approved") return "Approved";
  if (status === "rejected") return "Rejected";
  return "Pending";
}

export function JobRequestCard({ item, priority, onClick, onJustifyClick }: JobRequestCardProps) {
  function handleActionClick(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
  }

  return (
    <article
      className="ui-surface cursor-pointer p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick?.();
        }
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="ui-section-title truncate text-foreground">{item.jobDetailsForm.jobTitle}</p>
          <span className="mt-1 inline-flex rounded-[4px] bg-[rgba(30,102,247,0.1)] px-1.5 py-0.5 text-[10px] font-semibold uppercase text-primary">
            {departmentLabel(item.requestForm.department as JobRequestDepartment)}
          </span>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span
            className={`inline-flex rounded-md px-2 py-0.5 text-xs leading-4 ${priorityClasses(priority)}`}
          >
            {priorityLabel(priority)}
          </span>
        </div>
      </div>

      <div className="mt-3 space-y-1">
        <p className="ui-body text-muted-foreground">
          Type: <span className="font-medium text-foreground">{employmentTypeLabel(item.jobDetailsForm.employmentType)}</span>
        </p>
        <p className="ui-body text-muted-foreground">
          Work Mode: <span className="font-medium text-foreground">{workModeLabel(item.jobDetailsForm.workMode)}</span>
        </p>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <span className={`rounded-md px-2 py-1 text-[11px] ${progressClasses(item.progress.jm.status)}`}>
          JM: {progressLabel(item.progress.jm.status)}
        </span>
        <span className={`rounded-md px-2 py-1 text-[11px] ${progressClasses(item.progress.hr.status)}`}>
          HR: {progressLabel(item.progress.hr.status)}
        </span>
        <span className={`rounded-md px-2 py-1 text-[11px] ${progressClasses(item.progress.finance.status)}`}>
          Finance: {progressLabel(item.progress.finance.status)}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-end gap-2">
        <Button
          type="button"
          size="sm"
          className="h-7 cursor-pointer text-xs"
          onClick={handleActionClick}
        >
          Approve
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 cursor-pointer text-xs"
          onClick={(event) => {
            handleActionClick(event);
            onJustifyClick?.();
          }}
        >
          Justify
        </Button>
      </div>
    </article>
  );
}
