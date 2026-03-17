import { ChevronUp } from "lucide-react";
import { useState } from "react";

import type { ActiveJobItem } from "@/features/hr/recruitment/active-posting/types";
import { Badge } from "@/shared/components/ui/badge";

type JobDetailTabProps = {
  job: ActiveJobItem;
};

type EmployeeCardProps = {
  name: string;
  role: string;
  department: string;
  showDepartment?: boolean;
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const initials = parts.slice(0, 2).map((part) => part[0]!.toUpperCase());
  return initials.join("") || "--";
}

function priorityLabel(value: ActiveJobItem["priority"]) {
  if (value === "high") return "High";
  if (value === "medium") return "Medium";
  return "Low";
}

function priorityClass(value: ActiveJobItem["priority"]) {
  if (value === "high") return "border-[#1e66f7] text-[#1e66f7]";
  if (value === "medium") return "border-black text-black";
  return "border-[#e5e5e5] text-[#666]";
}

function EmployeeCard({
  name,
  role,
  department,
  showDepartment = true,
}: EmployeeCardProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1e66f7] text-sm font-semibold text-white">
        {getInitials(name)}
      </div>
      <div className="space-y-0.5">
        <p className="text-sm font-semibold tracking-[-0.2px] text-black">
          {name}
        </p>
        <p className="text-[12px] text-[#666]">{role}</p>
        {showDepartment ? (
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

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1">
      {items.map((item, index) => (
        <li
          key={`${item}-${index}`}
          className="relative pl-4 text-sm text-[#666] before:absolute before:left-0 before:text-[#1e66f7] before:content-['•']"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

export function JobDetailTab({ job }: JobDetailTabProps) {
  const [committeeOpen, setCommitteeOpen] = useState(true);
  const [revisionsOpen, setRevisionsOpen] = useState(true);
  const [approvedOpen, setApprovedOpen] = useState(true);

  return (
    <section className="space-y-6">
      <div className="rounded-[8px] bg-[#f3f3f3] p-4">
        <p className="text-sm font-semibold tracking-[-0.4px] text-black">
          Job Request Details
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-[12px] text-[#666]">Priority</p>
              <span
                className={`inline-flex h-[22px] items-center justify-center rounded-[6px] border px-[9px] py-[3px] text-[12px] font-medium leading-[16px] ${priorityClass(
                  job.priority,
                )}`}
              >
                {priorityLabel(job.priority)}
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-[12px] text-[#666]">Date Requested</p>
              <p className="text-sm tracking-[-0.2px] text-black">
                {job.postedAt}
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-[12px] text-[#666]">Due Date</p>
              <p className="text-sm tracking-[-0.2px] text-black">
                {job.closesAt}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[12px] text-[#666]">Expected Date</p>
              <p className="text-sm tracking-[-0.2px] text-black">
                {job.closesAt}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-[12px] text-[#666]">Requested By</p>
            <EmployeeCard
              name={job.requestedBy.name}
              role={job.requestedBy.role}
              department={job.requestedBy.department}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-[16px] font-semibold tracking-[-0.4px] text-black">
              Job Overview
            </h3>
            <p className="text-sm leading-5 text-[#666]">{job.summary}</p>
          </div>
          <div className="space-y-2">
            <h3 className="text-[16px] font-semibold tracking-[-0.4px] text-black">
              Requirements
            </h3>
            <BulletList items={job.requirements} />
          </div>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-[16px] font-semibold tracking-[-0.4px] text-black">
              Qualifications
            </h3>
            <BulletList items={job.keyResponsibilities} />
          </div>
          <div className="space-y-2">
            <h3 className="text-[16px] font-semibold tracking-[-0.4px] text-black">
              Importance of this Hire
            </h3>
            {job.importanceOfHire.map((item, index) => (
              <p key={`${item}-${index}`} className="text-sm leading-5 text-[#666]">
                {item}
              </p>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-[8px] bg-[#e9f0fe] px-3 py-2"
            onClick={() => setCommitteeOpen((prev) => !prev)}
          >
            <p className="text-sm font-semibold tracking-[-0.4px] text-black">
              Hiring Committee
            </p>
            <ChevronUp
              className={`h-4 w-4 text-[#1e66f7] ${committeeOpen ? "" : "rotate-180"}`}
            />
          </button>
          {committeeOpen ? (
            <div className="space-y-3">
              {job.hiringCommittee.map((member, index) => (
                <EmployeeCard
                  key={`${member.name}-${member.role}-${index}`}
                  name={member.name}
                  role={member.role}
                  department={member.department}
                  showDepartment
                />
              ))}
            </div>
          ) : null}
        </div>
        <div className="space-y-6">
          <div className="space-y-4">
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-[8px] bg-[#e9f0fe] px-3 py-2"
              onClick={() => setRevisionsOpen((prev) => !prev)}
            >
              <p className="text-sm font-semibold tracking-[-0.4px] text-black">
                Revisions From
              </p>
              <ChevronUp
                className={`h-4 w-4 text-[#1e66f7] ${revisionsOpen ? "" : "rotate-180"}`}
              />
            </button>
            {revisionsOpen ? (
              job.revisionsFrom.length > 0 ? (
                <div className="space-y-3">
                  {job.revisionsFrom.map((member, index) => (
                    <div
                      key={`${member.name}-${member.time}-${index}`}
                      className="space-y-1"
                    >
                      <EmployeeCard
                        name={member.name}
                        role={member.role}
                        department={member.department}
                      />
                      <div className="pl-11 text-[12px] text-[#666]">
                        {member.time} · {member.date}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#666]">No revisions requested.</p>
              )
            ) : null}
          </div>
          <div className="space-y-4">
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-[8px] bg-[#e9f0fe] px-3 py-2"
              onClick={() => setApprovedOpen((prev) => !prev)}
            >
              <p className="text-sm font-semibold tracking-[-0.4px] text-black">
                Approved By
              </p>
              <ChevronUp
                className={`h-4 w-4 text-[#1e66f7] ${approvedOpen ? "" : "rotate-180"}`}
              />
            </button>
            {approvedOpen ? (
              job.approvedBy.length > 0 ? (
                <div className="space-y-3">
                  {job.approvedBy.map((member, index) => (
                    <div
                      key={`${member.name}-${member.time}-${index}`}
                      className="space-y-1"
                    >
                      <EmployeeCard
                        name={member.name}
                        role={member.role}
                        department={member.department}
                      />
                      <div className="pl-11 text-[12px] text-[#666]">
                        {member.time} · {member.date}
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
      </div>

    </section>
  );
}
