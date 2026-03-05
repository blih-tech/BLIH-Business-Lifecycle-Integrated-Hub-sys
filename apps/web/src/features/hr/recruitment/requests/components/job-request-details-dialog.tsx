import type {
  JobRequestDepartment,
  JobRequestItem,
  JobRequestPriority,
} from '@/features/hr/recruitment/requests/types';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';

type JobRequestDetailsDialogProps = {
  request: JobRequestItem | null;
  onOpenChange: (isOpen: boolean) => void;
  onApprove: () => void;
  onJustify: (requestId: string) => void;
};

type DetailItemProps = {
  label: string;
  value: string | number;
  className?: string;
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

function priorityClass(priority: JobRequestPriority) {
  if (priority === 'high') return 'bg-[rgba(30,102,247,0.1)] text-primary';
  if (priority === 'medium') return 'bg-muted text-foreground';
  return 'bg-muted text-muted-foreground';
}

function requestIdLabel(id: string) {
  return id.toUpperCase().replace('JR-', 'REQ-');
}

function DetailItem({ label, value, className }: DetailItemProps) {
  return (
    <div className={className}>
      <p className="ui-meta text-muted-foreground">{label}</p>
      <p className="ui-body mt-0.5 font-semibold text-foreground">{value}</p>
    </div>
  );
}

export function JobRequestDetailsDialog({
  request,
  onOpenChange,
  onApprove,
  onJustify,
}: JobRequestDetailsDialogProps) {
  return (
    <Dialog open={request !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[84vh] w-[96vw] overflow-y-auto p-0 sm:w-[90vw] lg:w-[86vw] sm:max-w-[920px] xl:max-w-[980px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-2">
        {request ? (
          <>
            <DialogHeader className="border-b border-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <DialogTitle className="ui-section-title text-foreground">
                  {request.title}
                </DialogTitle>
                <span
                  className={`inline-flex rounded-md px-2 py-0.5 mr-6 text-xs font-medium ${priorityClass(request.priority)}`}
                >
                  {priorityLabel(request.priority)} Priority
                </span>
              </div>
              <DialogDescription className="mt-1 ui-body text-muted-foreground">
                Review detailed requisition information before you proceed with
                approval.
              </DialogDescription>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex rounded-md border border-border bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
                  {departmentLabel(request.department)}
                </span>
                <span className="inline-flex rounded-md border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  {requestIdLabel(request.id)}
                </span>
                <span className="inline-flex rounded-md border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  {request.employmentType}
                </span>
              </div>
            </DialogHeader>

            <div className="grid gap-3 p-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-3">
                <section className="ui-surface p-3.5">
                  <p className="ui-section-title text-foreground">
                    Request Snapshot
                  </p>
                  <div className="mt-2 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    <DetailItem
                      label="Requisition ID"
                      value={requestIdLabel(request.id)}
                    />
                    <DetailItem
                      label="Department"
                      value={departmentLabel(request.department)}
                    />
                    <DetailItem
                      label="Employment Type"
                      value={request.employmentType}
                    />
                    <DetailItem
                      label="Open Positions"
                      value={request.positions}
                    />
                    <DetailItem
                      label="Requested On"
                      value={request.requestedAt}
                    />
                    <DetailItem
                      label="Expected Start"
                      value={request.expectedStartDate}
                    />
                  </div>
                </section>

                <section className="ui-surface p-3.5">
                  <p className="ui-section-title text-foreground">
                    Request Owners
                  </p>
                  <div className="mt-2 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    <DetailItem
                      label="Requested By"
                      value={request.requestedBy}
                    />
                    <DetailItem
                      label="Hiring Manager"
                      value={request.hiringManager}
                    />
                    <DetailItem
                      label="Experience Level"
                      value={request.experienceLevel}
                      className="sm:col-span-2"
                    />
                  </div>
                </section>
              </div>

              <div className="space-y-3">
                <section className="ui-surface p-3.5">
                  <p className="ui-section-title text-foreground">
                    Business Justification
                  </p>
                  <p className="ui-body mt-2 text-muted-foreground">
                    {request.justification}
                  </p>
                </section>

                <section className="ui-surface p-3.5">
                  <p className="ui-section-title text-foreground">Key Skills</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {request.keySkills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-md border border-border bg-muted px-2 py-1 text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </section>
              </div>
            </div>

            <DialogFooter className="border-t border-border p-4">
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={() => onJustify(request.id)}
              >
                {request.secondaryActionLabel}
              </Button>
              <Button
                type="button"
                className="cursor-pointer"
                onClick={onApprove}
              >
                {request.primaryActionLabel}
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
