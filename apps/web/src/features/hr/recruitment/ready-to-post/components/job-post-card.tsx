import { Eye, Pencil, Send } from "lucide-react";

import type {
  JobPostItem,
  ReadyToPostDepartment,
  ReadyToPostPriority,
} from "@/features/hr/recruitment/ready-to-post/types";
import { Button } from "@/shared/components/ui/button";

type JobPostCardProps = {
  item: JobPostItem;
  onPreviewClick?: () => void;
  onEditClick?: () => void;
};

function departmentLabel(department: ReadyToPostDepartment) {
  if (department === "technical") return "TECHNICAL DEPT.";
  if (department === "creative") return "CREATIVE DEPT.";
  return "DIGITAL MARKETING DEPT.";
}

function priorityLabel(priority: ReadyToPostPriority) {
  if (priority === "high") return "High";
  if (priority === "medium") return "Medium";
  return "Low";
}

function priorityClass(priority: ReadyToPostPriority) {
  if (priority === "high") return "border-primary text-primary";
  if (priority === "medium") return "border-border text-foreground";
  return "border-border text-muted-foreground";
}

export function JobPostCard({ item, onPreviewClick, onEditClick }: JobPostCardProps) {
  return (
    <article className="ui-surface overflow-hidden">
      <div className="flex items-start justify-between gap-4 p-4 md:p-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="ui-section-title truncate text-foreground">{item.title}</h3>
            {item.levelTag ? (
              <span className="inline-flex rounded-md border border-primary px-1.5 py-0.5 text-[10px] text-primary">
                {item.levelTag}
              </span>
            ) : null}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="inline-flex rounded-[4px] bg-[rgba(30,102,247,0.1)] px-1.5 py-0.5 text-[10px] font-semibold uppercase text-primary">
              {departmentLabel(item.department)}
            </span>
            <span className="ui-meta">{item.employmentType}</span>
            <span className="ui-meta">
              {item.positions} {item.positions > 1 ? "Positions" : "Position"}
            </span>
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          className="h-8 cursor-pointer gap-1.5 text-xs"
        >
          <Send className="h-3.5 w-3.5" />
          Post Job
        </Button>
      </div>

      <div className="border-t border-border p-4 md:p-5">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_292px]">
          <div className="space-y-3">
            <div>
              <p className="ui-section-title text-foreground">Job Overview</p>
              <p className="ui-body mt-1 text-muted-foreground">{item.jobOverview}</p>
            </div>

            <div>
              <p className="ui-section-title text-foreground">Requirements</p>
              <ul className="mt-1 space-y-1">
                {item.requirements.map((requirement) => (
                  <li key={requirement} className="ui-body flex items-start gap-2 text-muted-foreground">
                    <span className="mt-1 text-primary">•</span>
                    <span>{requirement}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-lg bg-muted p-3.5">
              <p className="ui-section-title text-foreground">Job Request Details</p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <p className="ui-meta">Priority</p>
                  <span
                    className={`mt-1 inline-flex rounded-md border px-2 py-0.5 text-xs ${priorityClass(item.priority)}`}
                  >
                    {priorityLabel(item.priority)}
                  </span>
                </div>
                <div>
                  <p className="ui-meta">Due Date</p>
                  <p className="ui-body mt-1 font-semibold text-foreground">{item.dueDate}</p>
                </div>
                <div>
                  <p className="ui-meta">Requisition ID</p>
                  <p className="ui-body mt-1 font-semibold text-foreground">{item.requisitionId}</p>
                </div>
                <div>
                  <p className="ui-meta">Expected Date</p>
                  <p className="ui-body mt-1 font-semibold text-foreground">{item.expectedDate}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 cursor-pointer gap-1.5 border-primary text-xs text-primary hover:bg-primary hover:text-primary-foreground"
                onClick={onPreviewClick}
              >
                <Eye className="h-3.5 w-3.5" />
                Preview
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 cursor-pointer gap-1.5 text-xs"
                onClick={onEditClick}
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
