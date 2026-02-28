"use client";

import { ChevronDown, ChevronUp, Mail } from "lucide-react";
import { useState } from "react";

import type { EmploymentContract } from "@/features/hr/onboarding/contract/types";
import { Button } from "@/shared/components/ui/button";

type ContractCardProps = {
  contract: EmploymentContract;
  defaultExpanded?: boolean;
};

export function ContractCard({ contract, defaultExpanded = false }: ContractCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <article className="overflow-hidden rounded-[12px] border border-[#e5e5e5] bg-white">
      <div className="px-6 py-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#1e66f7] text-base font-semibold tracking-[-0.3125px] text-white">
              {contract.avatarText}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-base font-medium leading-4 tracking-[-0.3125px] text-black">{contract.name}</p>
                <span className="inline-flex rounded-[4px] bg-[rgba(30,102,247,0.1)] px-1 py-0.5 text-xs font-semibold uppercase leading-4 text-[#1e66f7]">
                  {contract.department}
                </span>
              </div>
              <p className="mt-1 text-sm tracking-[-0.1504px] text-[#666]">{contract.role}</p>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-auto cursor-pointer gap-1 p-0 text-xs font-medium tracking-[-0.1504px] text-primary hover:bg-transparent hover:text-primary"
            onClick={() => setIsExpanded((previous) => !previous)}
            aria-expanded={isExpanded}
          >
            {isExpanded ? <ChevronUp className="h-[14px] w-[14px]" /> : <ChevronDown className="h-[14px] w-[14px]" />}
            {isExpanded ? "Less" : "More"}
          </Button>
        </div>
      </div>

      <div
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
          isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="min-h-0 overflow-hidden border-t border-[#e5e5e5] px-6 py-4">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.48fr)]">
            <section>
              <div className="flex h-11 items-center gap-2 rounded-[8px] bg-[rgba(30,102,247,0.1)] px-3">
                <Mail className="h-[18px] w-[18px] text-primary" />
                <p className="text-sm tracking-[-0.1504px] text-black">
                  Offer letter sent on: <span className="font-semibold">{contract.offerSentOn}</span>
                </p>
              </div>

              <h3 className="mt-5 text-base font-semibold tracking-[-0.3125px] text-black">Role Summary</h3>
              <p className="mt-3 max-w-[460px] text-sm leading-5 tracking-[-0.1504px] text-[#666]">{contract.roleSummary}</p>

              <h4 className="mt-4 text-base font-medium tracking-[-0.3125px] text-black">Responsibilities</h4>
              <ul className="mt-2 space-y-1">
                {contract.responsibilities.map((item) => (
                  <li key={item} className="text-sm leading-5 tracking-[-0.1504px] text-[#666]">
                    <span className="mr-2 text-primary">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section className="flex h-full flex-col justify-between">
              <div className="rounded-[8px] bg-[#f3f3f3] p-4">
                <p className="text-base font-medium tracking-[-0.3125px] text-black">Overview</p>

                <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
                  <div>
                    <p className="text-xs leading-4 text-[#666]">Start Date</p>
                    <p className="mt-1 text-sm font-semibold tracking-[-0.1504px] text-black">{contract.overview.startDate}</p>
                  </div>
                  <div>
                    <p className="text-xs leading-4 text-[#666]">Probation Period</p>
                    <p className="mt-1 text-sm font-semibold tracking-[-0.1504px] text-black">
                      {contract.overview.probationPeriod}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs leading-4 text-[#666]">Work Hours</p>
                    <p className="mt-1 text-base font-medium tracking-[-0.3125px] text-black">{contract.overview.workHours}</p>
                  </div>
                  <div>
                    <p className="text-xs leading-4 text-[#666]">Salary & Payroll</p>
                    <p className="mt-1 text-sm font-semibold tracking-[-0.1504px] text-black">
                      {contract.overview.salaryPayroll}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2.5">
                <Button type="button" className="h-8 rounded-[6px] text-sm font-medium tracking-[-0.1504px]">
                  View Record
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-8 rounded-[6px] border-[#d9d9d9] bg-white text-sm font-medium tracking-[-0.1504px] text-black hover:bg-white"
                >
                  Visit Profile
                </Button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </article>
  );
}
