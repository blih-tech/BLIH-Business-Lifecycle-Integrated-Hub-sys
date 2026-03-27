import { Medal } from "lucide-react";

import type { OngoingTopMatch } from "@/features/hr/recruitment/ongoing-recruitment/types";

type TopMatchCardProps = {
  topMatch: OngoingTopMatch;
};

export function TopMatchCard({ topMatch }: TopMatchCardProps) {
  return (
    <article className="rounded-[8px] border border-primary bg-[rgba(30,102,247,0.05)] px-3 py-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-medium text-primary">
          <span className="inline-flex h-[17px] w-[17px] items-center justify-center rounded-full bg-primary text-white">
            <Medal className="h-2.5 w-2.5" />
          </span>
          Top Match
        </div>
        <span className="inline-flex items-center rounded-[4px] border border-primary px-[5px] py-[3px] text-[10px] font-bold text-primary">
          {topMatch.matchScore}%
        </span>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5">
        <div>
          <p className="text-base font-semibold tracking-[-0.3125px] text-black">{topMatch.fullName}</p>
          <p className="text-[11px] leading-4 text-[#666]">{topMatch.phone}</p>
        </div>
        <div>
          <p className="text-[11px] leading-4 text-[#666]">Experience</p>
          <p className="text-sm font-semibold tracking-[-0.1504px] text-black">{topMatch.experience}</p>
        </div>
        <div>
          <p className="text-[11px] leading-4 text-[#666]">Salary Expectation</p>
          <p className="text-sm font-semibold tracking-[-0.1504px] text-black">{topMatch.salaryExpectation}</p>
        </div>
        <div>
          <p className="text-[11px] leading-4 text-[#666]">Can Start</p>
          <p className="text-sm font-semibold tracking-[-0.1504px] text-black">{topMatch.canStart}</p>
        </div>
      </div>
    </article>
  );
}
