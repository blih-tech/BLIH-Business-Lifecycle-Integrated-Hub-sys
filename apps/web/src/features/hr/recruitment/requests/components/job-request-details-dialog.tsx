import {
  BriefcaseBusiness,
  CalendarClock,
  CircleDollarSign,
  MapPin,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import type {
  ApprovalProgressState,
  FullJobRequest,
  JobRequestDepartment,
} from "@/features/hr/recruitment/requests/types";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

type JobRequestDetailsDialogProps = {
  request: FullJobRequest | null;
  currentUserName: string;
  onOpenChange: (isOpen: boolean) => void;
  onApprove: () => void;
  onJustify: () => void;
};

type OverviewStatProps = {
  icon: typeof BriefcaseBusiness;
  label: string;
  value: string;
};

type InfoItemProps = {
  label: string;
  value: string;
};

type ListSectionProps = {
  title: string;
  items: string[];
  emptyLabel?: string;
};

function departmentLabel(department: JobRequestDepartment) {
  if (department === "technical") return "TECHNICAL DEPT.";
  if (department === "creative") return "CREATIVE DEPT.";
  return "DIGITAL MARKETING DEPT.";
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

function requestTypeLabel(value: FullJobRequest["requestForm"]["requestType"]) {
  if (value === "replacement") return "Replacement";
  return "New Role";
}

function urgencyLabel(value: FullJobRequest["requestForm"]["urgency"]) {
  if (value === "high") return "High";
  if (value === "medium") return "Medium";
  return "Low";
}

function urgencyClass(value: FullJobRequest["requestForm"]["urgency"]) {
  if (value === "high") return "border-primary/15 bg-primary/10 text-primary";
  if (value === "medium") return "border-border bg-muted text-foreground";
  return "border-border bg-muted text-muted-foreground";
}

function progressLabel(status: ApprovalProgressState) {
  if (status === "approved") return "Approved";
  if (status === "requested_review") return "Review Requested";
  if (status === "rejected") return "Rejected";
  return "Pending";
}

function progressClass(status: ApprovalProgressState) {
  if (status === "approved") return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (status === "requested_review") return "border-amber-200 bg-amber-50 text-amber-800";
  if (status === "rejected") return "border-red-200 bg-red-50 text-red-800";
  return "border-border bg-muted text-muted-foreground";
}

function salaryLabel(request: FullJobRequest) {
  const { salaryMode, salaryRangeMin, salaryRangeMax, salaryCurrency } = request.jobDetailsForm;
  if (salaryMode === "negotiable") return "Negotiable";
  if (salaryMode === "competitive") return "Competitive";
  if (salaryMode === "range") return `${salaryCurrency} ${salaryRangeMin} - ${salaryRangeMax}`;
  return "Not specified";
}

function isOwnRequest(requestedBy: string, currentUserName: string) {
  return requestedBy.trim().toLowerCase() === currentUserName.trim().toLowerCase();
}

function formatValue(value: string) {
  return value
    .split("_")
    .map((part) => (part ? part[0]!.toUpperCase() + part.slice(1) : part))
    .join(" ");
}

function OverviewStat({ icon: Icon, label, value }: OverviewStatProps) {
  return (
    <div className="rounded-xl border border-border/70 bg-background px-3 py-3">
      <div className="flex items-start gap-2.5">
        <div className="rounded-lg border border-border bg-muted/60 p-2 text-muted-foreground">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: InfoItemProps) {
  return (
    <div className="space-y-1 rounded-lg border border-border/70 bg-background px-3 py-3">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

function ListSection({ title, items, emptyLabel = "Not provided" }: ListSectionProps) {
  return (
    <section className="space-y-3 rounded-2xl border border-border/70 bg-card px-4 py-4">
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
      </div>
      {items.length > 0 ? (
        <div className="grid gap-2">
          {items.map((item) => (
            <div
              key={`${title}-${item}`}
              className="rounded-lg border border-border/70 bg-background px-3 py-2 text-sm text-foreground"
            >
              {item}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{emptyLabel}</p>
      )}
    </section>
  );
}

export function JobRequestDetailsDialog({
  request,
  currentUserName,
  onOpenChange,
  onApprove,
  onJustify,
}: JobRequestDetailsDialogProps) {
  const ownRequest = request ? isOwnRequest(request.requestForm.requestedBy, currentUserName) : false;

  return (
    <Dialog open={request !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] w-[97vw] overflow-y-auto p-0 sm:max-w-[1080px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-2">
        {request ? (
          <>
            <DialogHeader className="border-b border-border/70 bg-muted/20 px-5 py-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex rounded-md border border-border bg-background px-2 py-0.5 text-[11px] font-medium text-foreground">
                      {departmentLabel(request.requestForm.department as JobRequestDepartment)}
                    </span>
                    <span
                      className={`inline-flex rounded-md border px-2 py-0.5 text-[11px] font-medium ${urgencyClass(
                        request.requestForm.urgency,
                      )}`}
                    >
                      {urgencyLabel(request.requestForm.urgency)} Priority
                    </span>
                    <span className="inline-flex rounded-md border border-border bg-background px-2 py-0.5 text-[11px] text-muted-foreground">
                      {request.status === "posted" ? "Posted" : "Pending"}
                    </span>
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-semibold tracking-tight text-foreground">
                      {request.jobDetailsForm.jobTitle}
                    </DialogTitle>
                    <DialogDescription className="mt-1 text-sm text-muted-foreground">
                      {request.jobDetailsForm.location} · {employmentTypeLabel(request.jobDetailsForm.employmentType)} ·{" "}
                      {workModeLabel(request.jobDetailsForm.workMode)}
                    </DialogDescription>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                <OverviewStat
                  icon={CalendarClock}
                  label="Needed By"
                  value={request.requestForm.neededByDate}
                />
                <OverviewStat
                  icon={CircleDollarSign}
                  label="Salary"
                  value={salaryLabel(request)}
                />
                <OverviewStat
                  icon={MapPin}
                  label="Location"
                  value={request.jobDetailsForm.location}
                />
                <OverviewStat
                  icon={UserRound}
                  label="Requested By"
                  value={request.requestForm.requestedBy}
                />
              </div>
            </DialogHeader>

            <div className="grid gap-4 px-5 py-5 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-4">
                <section className="rounded-2xl border border-border/70 bg-card px-4 py-4">
                  <div className="mb-3">
                    <p className="text-sm font-semibold text-foreground">Request Overview</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Internal request context and hiring setup.
                    </p>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <InfoItem label="Position" value={formatValue(request.requestForm.position)} />
                    <InfoItem label="Request Type" value={requestTypeLabel(request.requestForm.requestType)} />
                    <InfoItem label="Department" value={departmentLabel(request.requestForm.department as JobRequestDepartment)} />
                    <InfoItem label="Experience Level" value={formatValue(request.jobDetailsForm.experienceLevel)} />
                    <InfoItem label="Employment Type" value={employmentTypeLabel(request.jobDetailsForm.employmentType)} />
                    <InfoItem label="Work Mode" value={workModeLabel(request.jobDetailsForm.workMode)} />
                    {request.requestForm.requestType === "replacement" ? (
                      <InfoItem label="Replace For" value={request.requestForm.replaceFor || "Not provided"} />
                    ) : null}
                  </div>
                </section>

                <section className="rounded-2xl border border-border/70 bg-card px-4 py-4">
                  <div className="mb-3">
                    <p className="text-sm font-semibold text-foreground">Role Details</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Public-facing information for the job post.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div className="rounded-xl border border-border/70 bg-background px-3 py-3">
                      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                        Job Summary
                      </p>
                      <p className="mt-2 text-sm leading-6 text-foreground">
                        {request.jobDetailsForm.jobSummary}
                      </p>
                    </div>

                    {request.jobDetailsForm.whyJoinUs ? (
                      <div className="rounded-xl border border-border/70 bg-background px-3 py-3">
                        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                          Why Join Us
                        </p>
                        <p className="mt-2 text-sm leading-6 text-foreground">
                          {request.jobDetailsForm.whyJoinUs}
                        </p>
                      </div>
                    ) : null}

                    <div className="grid gap-4 xl:grid-cols-2">
                      <ListSection title="Key Responsibilities" items={request.jobDetailsForm.keyResponsibilities} />
                      <ListSection title="Requirements" items={request.jobDetailsForm.requirements} />
                    </div>

                    <div className="grid gap-4 xl:grid-cols-2">
                      <ListSection title="Preferred Skills" items={request.jobDetailsForm.preferredSkills} />
                      <ListSection title="Benefits" items={request.jobDetailsForm.benefits} />
                    </div>
                  </div>
                </section>
              </div>

              <div className="space-y-4">
                <section className="rounded-2xl border border-border/70 bg-card px-4 py-4">
                  <div className="mb-3 flex items-start gap-2.5">
                    <div className="rounded-lg border border-border bg-muted/60 p-2 text-muted-foreground">
                      <BriefcaseBusiness className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Business Justification</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Reason for opening this role.
                      </p>
                    </div>
                  </div>
                  <p className="text-sm leading-6 text-foreground">
                    {request.requestForm.businessJustification}
                  </p>
                </section>

                <section className="rounded-2xl border border-border/70 bg-card px-4 py-4">
                  <div className="mb-3 flex items-start gap-2.5">
                    <div className="rounded-lg border border-border bg-muted/60 p-2 text-muted-foreground">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Approval Progress</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Current decision state across the review flow.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {(["jm", "hr", "finance"] as const).map((key) => {
                      const step = request.progress[key];
                      const label = key === "jm" ? "JM" : key === "hr" ? "HR" : "Finance";
                      return (
                        <div
                          key={key}
                          className="rounded-xl border border-border/70 bg-background px-3 py-3"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-medium text-foreground">{label}</p>
                            <span
                              className={`inline-flex rounded-md border px-2 py-0.5 text-[11px] font-medium ${progressClass(step.status)}`}
                            >
                              {progressLabel(step.status)}
                            </span>
                          </div>
                          {step.justification ? (
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                              {step.justification}
                            </p>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </section>
              </div>
            </div>

            <DialogFooter className="border-t border-border/70 px-5 py-4">
              {ownRequest ? (
                <div className="w-full rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
                  Waiting for other reviewers to make a decision on this request.
                </div>
              ) : (
                <>
                  <Button type="button" variant="outline" className="cursor-pointer" onClick={onJustify}>
                    Justify
                  </Button>
                  <Button type="button" className="cursor-pointer" onClick={onApprove}>
                    Approve
                  </Button>
                </>
              )}
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
