import { Eye, Pencil, Send } from "lucide-react";

import type {
  ReadyToPostDepartment,
  ReadyToPostJob,
  ReadyToPostPriority,
} from "@/features/hr/recruitment/ready-to-post/types";
import { Button } from "@/shared/components/ui/button";

type JobPostCardProps = {
  item: ReadyToPostJob;
  onPreviewClick?: () => void;
  onPostClick?: () => void;
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
  if (priority === "high") return "border-[#1e66f7] text-[#1e66f7]";
  if (priority === "medium") return "border-black text-black";
  return "border-[#e5e5e5] text-[#666]";
}

function priorityFromUrgency(
  urgency: ReadyToPostJob["requestForm"]["urgency"],
): ReadyToPostPriority {
  if (urgency === "HIGH") return "high";
  if (urgency === "MEDIUM") return "medium";
  return "low";
}

function employmentTypeLabel(
  value: ReadyToPostJob["jobDetailsForm"]["employmentType"],
) {
  if (value === "FULL_TIME") return "Full-time";
  if (value === "PART_TIME") return "Part-time";
  if (value === "CONTRACT") return "Contract";
  return "Intern";
}

function experienceLevelLabel(
  value: ReadyToPostJob["jobDetailsForm"]["experienceLevel"],
) {
  if (value === "ENTRY") return "Entry";
  if (value === "MID") return "Mid";
  if (value === "SENIOR") return "Senior";
  return "Lead";
}

function positionsLabel(value?: string) {
  if (!value) return "1 Position";
  return `${value} Position${value === "1" ? "" : "s"}`;
}

function initials(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  const letters = parts.slice(0, 2).map((part) => part[0]?.toUpperCase());
  return letters.join("") || "--";
}

export function JobPostCard({
  item,
  onPreviewClick,
  onPostClick,
}: JobPostCardProps) {
  const priority = priorityFromUrgency(item.requestForm.urgency);

  return (
    <article className="rounded-[12px] border border-[#e5e5e5] bg-white">
      <div className="flex items-start justify-between gap-4 p-[24px]">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-[16px]">
            <h3 className="text-[18px] font-semibold tracking-[-0.4px] text-black">
              {item.jobDetailsForm.title}
            </h3>
            <span className="inline-flex h-[22px] items-center justify-center rounded-[4px] border border-[#1e66f7] px-[9px] py-[3px] text-[12px] font-medium leading-[16px] text-[#1e66f7]">
              {experienceLevelLabel(item.jobDetailsForm.experienceLevel)}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-[24px] text-[14px] leading-[20px] tracking-[-0.2px] text-[#666]">
            <span className="inline-flex items-center rounded-[4px] bg-[#e9f0fe] px-[4px] py-[2px] text-[12px] font-semibold uppercase leading-[16px] text-[#1e66f7]">
              {departmentLabel(
                item.requestForm.department as ReadyToPostDepartment,
              )}
            </span>
            <span>{employmentTypeLabel(item.jobDetailsForm.employmentType)}</span>
            <span>{positionsLabel(item.requestForm.openings)}</span>
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          className="h-[32px] gap-[8px] rounded-[6px] bg-[#1e66f7] px-[16px] py-[6px] text-[14px] font-medium leading-[20px] tracking-[-0.2px] text-white hover:bg-[#1e66f7]"
          onClick={onPostClick}
        >
          <Send className="h-4 w-4" />
          Post Job
        </Button>
      </div>

      <div className="border-t border-[#e5e5e5]" />

      <div className="flex flex-col gap-[16px] p-[24px]">
        <div className="rounded-[8px] bg-[#f3f3f3] p-[16px]">
          <p className="text-[16px] font-semibold tracking-[-0.4px] text-black">
            Job Request Details
          </p>
          <div className="mt-4 grid gap-[16px] md:grid-cols-3">
            <div className="space-y-2">
              <div>
                <p className="text-[12px] text-[#666]">Priority</p>
                <span
                  className={`mt-1 inline-flex h-[22px] items-center justify-center rounded-[6px] border px-[9px] py-[3px] text-[12px] font-medium leading-[16px] ${priorityClass(
                    priority,
                  )}`}
                >
                  {priorityLabel(priority)}
                </span>
              </div>
              <div>
                <p className="text-[12px] text-[#666]">Date Requested</p>
                <p className="text-[14px] leading-[20px] tracking-[-0.2px] text-black">
                  {item.requestForm.createdDate}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-[12px] text-[#666]">Due Date</p>
                <p className="text-[14px] leading-[20px] tracking-[-0.2px] text-black">
                  {item.requestForm.neededByDate}
                </p>
              </div>
              <div>
                <p className="text-[12px] text-[#666]">Expected Date</p>
                <p className="text-[14px] leading-[20px] tracking-[-0.2px] text-black">
                  {item.requestForm.neededByDate}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-[12px] text-[#666]">Requested By</p>
              <div className="flex items-center gap-3">
                <div className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-[#1e66f7] text-[16px] font-semibold tracking-[-0.4px] text-white">
                  {initials(item.requestForm.requestedBy ?? "User")}
                </div>
                <div className="space-y-1">
                  <p className="text-[16px] font-semibold leading-[20px] tracking-[-0.4px] text-black">
                    {item.requestForm.requestedBy ?? "Request Owner"}
                  </p>
                  <p className="text-[12px] leading-[16px] text-[#666]">
                    {item.requestForm.position.replace(/_/g, " ")}
                  </p>
                  <span className="inline-flex rounded-[4px] bg-[#e9f0fe] px-[6px] py-[2px] text-[11px] font-semibold uppercase leading-[14px] text-[#1e66f7]">
                    {departmentLabel(
                      item.requestForm.department as ReadyToPostDepartment,
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-[24px] md:grid-cols-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-[16px] font-semibold tracking-[-0.4px] text-black">
                Job Overview
              </p>
              <p className="text-[14px] leading-[20px] tracking-[-0.2px] text-[#666]">
                {item.jobDetailsForm.description}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-[16px] font-semibold tracking-[-0.4px] text-black">
                Requirements
              </p>
              <ul className="space-y-1">
                {(item.jobDetailsForm.requiredSkills ?? "")
                  .split("\n")
                  .map((requirement) => requirement.trim())
                  .filter(Boolean)
                  .map((requirement) => (
                  <li
                    key={requirement}
                    className="flex items-start gap-2 text-[14px] text-[#666]"
                  >
                    <span className="text-[#1e66f7]">•</span>
                    <span>{requirement}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-[16px] font-semibold tracking-[-0.4px] text-black">
                Qualifications
              </p>
              <ul className="space-y-1">
                {(item.jobDetailsForm.responsibilities ?? "")
                  .split("\n")
                  .map((requirement) => requirement.trim())
                  .filter(Boolean)
                  .map((requirement) => (
                  <li
                    key={requirement}
                    className="flex items-start gap-2 text-[14px] text-[#666]"
                  >
                    <span className="text-[#1e66f7]">•</span>
                    <span>{requirement}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-2">
              <p className="text-[16px] font-semibold tracking-[-0.4px] text-black">
                Importance of this Hire
              </p>
              <p className="text-[14px] leading-[20px] tracking-[-0.2px] text-[#666]">
                {item.requestForm.businessJustification}
              </p>
              {item.jobDetailsForm.summary ? (
                <p className="text-[14px] leading-[20px] tracking-[-0.2px] text-[#666]">
                  {item.jobDetailsForm.summary}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="grid w-full grid-cols-2 gap-[16px]">
          <Button
            type="button"
            variant="outline"
            className="h-[32px] w-full gap-[8px] rounded-[6px] border-[#1e66f7] text-[14px] font-medium leading-[20px] tracking-[-0.2px] text-[#1e66f7] hover:bg-white"
            onClick={onPreviewClick}
          >
            <Eye className="h-4 w-4" />
            Preview
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-[32px] w-full gap-[8px] rounded-[6px] border-[#e5e5e5] text-[14px] font-medium leading-[20px] tracking-[-0.2px] text-black hover:bg-white"
          >
            <Pencil className="h-4 w-4" />
            Edit Job
          </Button>
        </div>
      </div>
    </article>
  );
}


