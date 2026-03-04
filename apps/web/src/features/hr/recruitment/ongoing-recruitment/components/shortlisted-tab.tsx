import { UsersRound } from "lucide-react";

import { PipelineCandidateCard } from "@/features/hr/recruitment/ongoing-recruitment/components/pipeline-candidate-card";
import type { OngoingRecruitmentJob } from "@/features/hr/recruitment/ongoing-recruitment/types";

type ShortlistedTabProps = {
  job: OngoingRecruitmentJob;
};

export function ShortlistedTab({ job }: ShortlistedTabProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2 border-b border-border pb-4">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-[6px] bg-primary text-white">
          <UsersRound className="h-4 w-4" />
        </span>
        <p className="text-base font-medium tracking-[-0.3125px] text-black">Shortlist</p>
      </div>

      <div className="max-h-[320px] overflow-y-auto pr-1">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {job.shortlisted.map((candidate) => (
            <PipelineCandidateCard key={candidate.id} candidate={candidate} />
          ))}
        </div>
      </div>
    </section>
  );
}
