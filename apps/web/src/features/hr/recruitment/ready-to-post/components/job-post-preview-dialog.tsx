"use client";

import { ChevronUp, Pencil, Send } from "lucide-react";
import { useMemo, useState } from "react";

import type { ApprovalProgressState } from "@/features/hr/recruitment/requests/types";
import type {
  ReadyToPostDepartment,
  ReadyToPostJob,
} from "@/features/hr/recruitment/ready-to-post/types";
import { Badge } from "@/shared/components/ui/badge";
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
  item: ReadyToPostJob | null;
  onOpenChange: (isOpen: boolean) => void;
  onPost?: () => void;
};

type EmployeeCardProps = {
  name: string;
  role?: string;
  department?: string;
  variant?: "stacked" | "inline";
};

type BulletListProps = {
  items: string[];
};

type InfoBlockProps = {
  label: string;
  value: string;
  valueBadge?: boolean;
};

function departmentLabel(department: ReadyToPostDepartment) {
  if (department === "technical") return "TECHNICAL DEPT.";
  if (department === "creative") return "CREATIVE DEPT.";
  return "DIGITAL MARKETING DEPT.";
}

function employmentTypeLabel(
  value: ReadyToPostJob["jobDetailsForm"]["employmentType"],
) {
  if (value === "FULL_TIME") return "Full-time";
  if (value === "PART_TIME") return "Part-time";
  if (value === "CONTRACT") return "Contract";
  return "Intern";
}

function urgencyLabel(value: ReadyToPostJob["requestForm"]["urgency"]) {
  if (value === "HIGH") return "High";
  if (value === "MEDIUM") return "Medium";
  return "Low";
}

function formatValue(value: string) {
  return value
    .split("_")
    .map((part) => (part ? part[0]!.toUpperCase() + part.slice(1) : part))
    .join(" ");
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const initials = parts.slice(0, 2).map((part) => part[0]!.toUpperCase());
  return initials.join("") || "--";
}

function formatPositions(openings?: string) {
  if (!openings) return "1 Position";
  const numeric = Number(openings);
  if (Number.isNaN(numeric) || numeric <= 0) return openings;
  return `${numeric} Position${numeric === 1 ? "" : "s"}`;
}

function EmployeeCard({
  name,
  role,
  department,
  variant = "inline",
}: EmployeeCardProps) {
  return (
    <div
      className={`flex items-center gap-2 ${variant === "stacked" ? "items-start" : ""}`}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1e66f7] text-sm font-semibold text-white">
        {getInitials(name)}
      </div>
      <div className={variant === "stacked" ? "space-y-1" : "flex items-center gap-2"}>
        <div className={variant === "stacked" ? "space-y-0.5" : ""}>
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
  if (items.length === 0) {
    return <p className="text-sm text-[#666]">No details provided.</p>;
  }

  return (
    <ul className="space-y-1">
      {items.map((itemText) => (
        <li
          key={itemText}
          className="relative pl-4 text-sm text-[#666] before:absolute before:left-0 before:text-[#1e66f7] before:content-['•']"
        >
          {itemText}
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

export function JobPostPreviewDialog({
  item,
  onOpenChange,
  onPost,
}: JobPostPreviewDialogProps) {
  const [isCommitteeOpen, setIsCommitteeOpen] = useState(true);
  const [isRevisionsOpen, setIsRevisionsOpen] = useState(true);
  const [isApprovedOpen, setIsApprovedOpen] = useState(true);

  const hiringCommittee = useMemo(
    () =>
      item
        ? [
            {
              name: item.requestForm.requestedBy ?? "Request Owner",
              role: formatValue(item.requestForm.position),
              department: departmentLabel(
                item.requestForm.department as ReadyToPostDepartment,
              ),
            },
          ]
        : [],
    [item],
  );

  const revisionSources = useMemo(
    () =>
      item
        ? (
            Object.entries(item.progress) as [
              string,
              { status: ApprovalProgressState },
            ][]
          )
            .filter(
              ([, step]) =>
                step.status === "requested_review" || step.status === "rejected",
            )
            .map(([key]) => ({
              name: `${key.toUpperCase()} Reviewer`,
              role: "Review Team",
              department: departmentLabel(
                item.requestForm.department as ReadyToPostDepartment,
              ),
            }))
        : [],
    [item],
  );

  const approvedBy = useMemo(
    () =>
      item
        ? (
            Object.entries(item.progress) as [
              string,
              { status: ApprovalProgressState },
            ][]
          )
            .filter(([, step]) => step.status === "approved")
            .map(([key]) => ({
              name: `${key.toUpperCase()} Approver`,
              role: "Approval Team",
              department: departmentLabel(
                item.requestForm.department as ReadyToPostDepartment,
              ),
            }))
        : [],
    [item],
  );

  return (
    <Dialog open={item !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] w-[96vw] overflow-y-auto rounded-[24px] border border-[#e5e5e5] bg-white p-0 sm:max-w-[920px] [&::-webkit-scrollbar]:w-0 [scrollbar-width:none]">
        {item ? (
          <>
            <DialogHeader className="p-6">
              <div className="flex w-full flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1 space-y-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <DialogTitle className="text-[18px] font-semibold tracking-[-0.4px] text-black">
                      {item.jobDetailsForm.title}
                    </DialogTitle>
                    <Badge
                      variant="outline"
                      className="rounded-[4px] border-[#1e66f7] px-2 py-0.5 text-[12px] font-medium text-[#1e66f7]"
                    >
                      {formatValue(item.jobDetailsForm.experienceLevel)}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-6 text-sm text-[#666]">
                    <Badge
                      variant="secondary"
                      className="rounded-[4px] bg-[#e9f0fe] px-1.5 py-0.5 text-[12px] font-semibold uppercase text-[#1e66f7]"
                    >
                      {departmentLabel(
                        item.requestForm.department as ReadyToPostDepartment,
                      )}
                    </Badge>
                    <span>
                      {employmentTypeLabel(item.jobDetailsForm.employmentType)}
                    </span>
                    <span>{formatPositions(item.requestForm.openings)}</span>
                  </div>
                </div>
                <Button
                  type="button"
                  className="h-[32px] gap-[8px] rounded-[6px] bg-[#1e66f7] px-[16px] py-[6px] text-[14px] font-medium leading-[20px] tracking-[-0.2px] text-white hover:bg-[#1e66f7]"
                  onClick={onPost}
                >
                  <Send className="h-4 w-4" />
                  Post Job
                </Button>
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
                      value={urgencyLabel(item.requestForm.urgency)}
                      valueBadge
                    />
                    <InfoBlock
                      label="Date Requested"
                      value={item.requestForm.createdDate ?? "Not set"}
                    />
                  </div>
                  <div className="space-y-4">
                    <InfoBlock
                      label="Due Date"
                      value={item.requestForm.neededByDate}
                    />
                    <InfoBlock
                      label="Expected Date"
                      value={item.requestForm.neededByDate}
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-[12px] text-[#666]">Requested By</p>
                    <EmployeeCard
                      name={item.requestForm.requestedBy ?? "Request Owner"}
                      role={formatValue(item.requestForm.position)}
                      department={departmentLabel(
                        item.requestForm.department as ReadyToPostDepartment,
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
                      {item.jobDetailsForm.description}
                    </DialogDescription>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold tracking-[-0.4px] text-black">
                      Requirements
                    </p>
                    <BulletList
                      items={(item.jobDetailsForm.requiredSkills ?? "")
                        .split("\n")
                        .map((itemText) => itemText.trim())
                        .filter(Boolean)}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold tracking-[-0.4px] text-black">
                      Qualifications
                    </p>
                    <BulletList
                      items={(item.jobDetailsForm.responsibilities ?? "")
                        .split("\n")
                        .map((itemText) => itemText.trim())
                        .filter(Boolean)}
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold tracking-[-0.4px] text-black">
                      Importance of this Hire
                    </p>
                    <p className="text-sm leading-5 text-[#666]">
                      {item.requestForm.businessJustification}
                    </p>
                    {item.jobDetailsForm.summary ? (
                      <p className="text-sm leading-5 text-[#666]">
                        {item.jobDetailsForm.summary}
                      </p>
                    ) : null}
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
                      className={`h-4 w-4 text-[#1e66f7] ${isCommitteeOpen ? "" : "rotate-180"}`}
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
                <div className="space-y-6">
                  <div className="space-y-4">
                    <button
                      type="button"
                      className="flex w-full cursor-pointer items-center justify-between rounded-[8px] bg-[#e9f0fe] px-3 py-2"
                      onClick={() => setIsRevisionsOpen((prev) => !prev)}
                    >
                      <p className="text-sm font-semibold tracking-[-0.4px] text-black">
                        Revisions From
                      </p>
                      <ChevronUp
                        className={`h-4 w-4 text-[#1e66f7] ${isRevisionsOpen ? "" : "rotate-180"}`}
                      />
                    </button>
                    {isRevisionsOpen ? (
                      revisionSources.length > 0 ? (
                        <div className="space-y-3">
                          {revisionSources.map((member) => (
                            <div key={member.name} className="space-y-1">
                              <EmployeeCard
                                name={member.name}
                                role={member.role}
                                department={member.department}
                              />
                              <div className="flex items-center gap-2 pl-11 text-[12px] text-[#666]">
                                <span>02:33 PM · Dec 30, 2025</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-[#666]">
                          No revisions requested.
                        </p>
                      )
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
                        className={`h-4 w-4 text-[#1e66f7] ${isApprovedOpen ? "" : "rotate-180"}`}
                      />
                    </button>
                    {isApprovedOpen ? (
                      approvedBy.length > 0 ? (
                        <div className="space-y-3">
                          {approvedBy.map((member) => (
                            <div key={member.name} className="space-y-1">
                              <EmployeeCard
                                name={member.name}
                                role={member.role}
                                department={member.department}
                              />
                              <div className="flex items-center gap-2 pl-11 text-[12px] text-[#666]">
                                <span>02:33 PM · Dec 30, 2025</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-[#666]">No approvals yet.</p>
                      )
                    ) : null}
                  </div>
                </div>
              </section>
            </div>

            <DialogFooter className="gap-3 border-t border-[#e5e5e5] p-6">
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
                >
                  <Pencil className="h-4 w-4" />
                  Edit Job
                </Button>
              </div>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
