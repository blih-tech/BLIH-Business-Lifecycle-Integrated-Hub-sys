"use client";

import type {
  JobPostItem,
  ReadyToPostDepartment,
  ReadyToPostPriority,
} from "@/features/hr/recruitment/ready-to-post/types";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

type JobPostPreviewDialogProps = {
  item: JobPostItem | null;
  onOpenChange: (isOpen: boolean) => void;
};

function departmentLabel(department: ReadyToPostDepartment) {
  if (department === "technical") return "TECHNICAL DEPT.";
  if (department === "creative") return "CREATIVE DEPT.";
  return "DIGITAL MARKETING DEPT.";
}

function priorityClass(priority: ReadyToPostPriority) {
  if (priority === "high") return "border-primary bg-[rgba(30,102,247,0.1)] text-primary";
  if (priority === "medium") return "border-border bg-muted text-foreground";
  return "border-border bg-muted text-muted-foreground";
}

type PreviewMetaItemProps = {
  label: string;
  value: string | number;
};

function PreviewMetaItem({ label, value }: PreviewMetaItemProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <p className="ui-meta text-muted-foreground">{label}</p>
      <p className="ui-body mt-1 font-semibold text-foreground">{value}</p>
    </div>
  );
}

export function JobPostPreviewDialog({ item, onOpenChange }: JobPostPreviewDialogProps) {
  return (
    <Dialog open={item !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[86vh] w-[96vw] overflow-y-auto p-0 sm:w-[92vw] sm:max-w-[1080px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-2">
        {item ? (
          <>
            <DialogHeader className="border-b border-border p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <DialogTitle className="ui-section-title text-foreground">{item.title}</DialogTitle>
                  <DialogDescription className="ui-body mt-1 text-muted-foreground">
                    Public job post preview for review before publishing.
                  </DialogDescription>
                </div>
                <span
                  className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-medium ${priorityClass(item.priority)}`}
                >
                  {item.priority.toUpperCase()} PRIORITY
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex rounded-md border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  {departmentLabel(item.department)}
                </span>
                <span className="inline-flex rounded-md border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  {item.employmentType}
                </span>
                <span className="inline-flex rounded-md border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  {item.positions} {item.positions > 1 ? "Positions" : "Position"}
                </span>
                <span className="inline-flex rounded-md border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  {item.levelTag ?? "Role"}
                </span>
              </div>
            </DialogHeader>

            <div className="grid gap-4 p-5 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="space-y-4">
                <section className="ui-surface p-4">
                  <p className="ui-section-title text-foreground">Job Overview</p>
                  <p className="ui-body mt-2 text-muted-foreground">{item.jobOverview}</p>
                </section>

                <section className="ui-surface p-4">
                  <p className="ui-section-title text-foreground">Role Responsibilities</p>
                  <ul className="mt-2 space-y-2">
                    {item.responsibilities.map((responsibility) => (
                      <li key={responsibility} className="ui-body flex items-start gap-2 text-muted-foreground">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                        <span>{responsibility}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="ui-surface p-4">
                  <p className="ui-section-title text-foreground">Requirements</p>
                  <ul className="mt-2 space-y-2">
                    {item.requirements.map((requirement) => (
                      <li key={requirement} className="ui-body flex items-start gap-2 text-muted-foreground">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                        <span>{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>

              <div className="space-y-4">
                <section className="ui-surface p-4">
                  <p className="ui-section-title text-foreground">Posting Details</p>
                  <div className="mt-3 grid grid-cols-1 gap-2.5">
                    <PreviewMetaItem label="Requisition ID" value={item.requisitionId} />
                    <PreviewMetaItem label="Team" value={item.team} />
                    <PreviewMetaItem label="Location" value={item.location} />
                    <PreviewMetaItem label="Salary Range" value={item.salaryRange} />
                    <PreviewMetaItem label="Due Date" value={item.dueDate} />
                    <PreviewMetaItem label="Expected Start" value={item.expectedDate} />
                  </div>
                </section>

                <section className="ui-surface p-4">
                  <p className="ui-section-title text-foreground">Benefits</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.benefits.map((benefit) => (
                      <span key={benefit} className="rounded-md border border-border bg-muted px-2 py-1 text-xs">
                        {benefit}
                      </span>
                    ))}
                  </div>
                </section>
              </div>
            </div>

            <DialogFooter className="border-t border-border p-5">
              <Button type="button" variant="outline" className="cursor-pointer" onClick={() => onOpenChange(false)}>
                Close Preview
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
