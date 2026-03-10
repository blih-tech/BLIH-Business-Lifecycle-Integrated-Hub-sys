import type {
  FullJobRequest,
  JobRequestDepartment,
  JobRequestPriority,
} from "@/features/hr/recruitment/requests/types";
import type { MouseEvent } from "react";
import { Button } from "@/shared/components/ui/button";

type JobRequestCardProps = {
  item: FullJobRequest;
  priority: JobRequestPriority;
  currentUserName: string;
  onClick?: () => void;
  onJustifyClick?: () => void;
};

function isOwnRequest(requestedBy: string, currentUserName: string) {
  return requestedBy.trim().toLowerCase() === currentUserName.trim().toLowerCase();
}

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

function formatPosition(value: string) {
  if (!value.trim()) return "Not set";
  return value
    .split("_")
    .map((part) => (part ? part[0]!.toUpperCase() + part.slice(1) : part))
    .join(" ");
}

function formatCreatedDate(value?: string) {
  if (!value?.trim()) return "Not set";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(parsed);
}

export function JobRequestCard({ item, priority, currentUserName, onClick, onJustifyClick }: JobRequestCardProps) {
  const ownRequest = isOwnRequest(item.requestForm.requestedBy, currentUserName);

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
          Position: <span className="font-medium text-foreground">{formatPosition(item.requestForm.position)}</span>
        </p>
        <p className="ui-body text-muted-foreground">
          Openings: <span className="font-medium text-foreground">{item.requestForm.openings || "Not set"}</span>
        </p>
        <p className="ui-body text-muted-foreground">
          Created: <span className="font-medium text-foreground">{formatCreatedDate(item.requestForm.createdDate)}</span>
        </p>
      </div>

      {ownRequest ? (
        <div className="mt-3 rounded-lg border border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
          Waiting for other reviewers to make a decision.
        </div>
      ) : (
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
      )}
    </article>
  );
}
