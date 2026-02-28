import { Star } from "lucide-react";

import type { OngoingPipelineCandidate } from "@/features/hr/recruitment/ongoing-recruitment/types";

type PipelineCandidateCardProps = {
  candidate: OngoingPipelineCandidate;
};

export function PipelineCandidateCard({ candidate }: PipelineCandidateCardProps) {
  return (
    <article className="rounded-[12px] bg-[#f3f3f3] p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium leading-5 tracking-[-0.1504px] text-black">{candidate.fullName}</p>
          <p className="mt-1 text-xs text-[#666]">{candidate.phone}</p>
        </div>
        <span className="inline-flex h-[22px] w-fit items-center gap-1 rounded-[4px] border border-primary px-[5px] py-[3px] text-[10px] font-bold text-primary">
          <Star className="h-2.5 w-2.5 fill-[#ffe345] text-[#ffe345]" />
          {candidate.rating}%
        </span>
      </div>
      <p className="mt-5 text-xs text-[#666]">{candidate.listedAt}</p>
    </article>
  );
}

