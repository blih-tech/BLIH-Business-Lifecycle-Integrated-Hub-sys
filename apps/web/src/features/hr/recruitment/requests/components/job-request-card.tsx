import type {
  JobRequestDepartment,
  JobRequestItem,
  JobRequestPriority,
} from "@/features/hr/recruitment/requests/types";
import { Button } from "@/shared/components/ui/button";

type JobRequestCardProps = {
  item: JobRequestItem;
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

export function JobRequestCard({ item }: JobRequestCardProps) {
  return (
    <article className="ui-surface cursor-pointer p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="ui-section-title truncate text-foreground">{item.title}</p>
          <span className="mt-1 inline-flex rounded-[4px] bg-[rgba(30,102,247,0.1)] px-1.5 py-0.5 text-[10px] font-semibold uppercase text-primary">
            {departmentLabel(item.department)}
          </span>
        </div>
        <span
          className={`inline-flex rounded-md px-2 py-0.5 text-xs leading-4 ${priorityClasses(item.priority)}`}
        >
          {priorityLabel(item.priority)}
        </span>
      </div>

      <div className="mt-3 space-y-1">
        <p className="ui-body text-muted-foreground">
          Positions: <span className="font-medium text-foreground">{item.positions}</span>
        </p>
        <p className="ui-body text-muted-foreground">
          Type: <span className="font-medium text-foreground">{item.employmentType}</span>
        </p>
        <p className="ui-body text-muted-foreground">
          Requested: <span className="font-medium text-foreground">{item.requestedAt}</span>
        </p>
      </div>

      <div className="mt-3 flex items-center justify-end gap-2">
        <Button
          type="button"
          size="sm"
          className="h-7 cursor-pointer text-xs"
        >
          {item.primaryActionLabel}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 cursor-pointer text-xs"
        >
          {item.secondaryActionLabel}
        </Button>
      </div>
    </article>
  );
}
