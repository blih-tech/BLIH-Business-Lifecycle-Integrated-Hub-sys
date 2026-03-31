"use client";

import { UsersRound } from "lucide-react";
import { useState } from "react";

import { CandidateDetailDialog } from "@/features/hr/recruitment/ongoing-recruitment/components/candidate-detail-dialog";
import { PipelineCandidateCard } from "@/features/hr/recruitment/ongoing-recruitment/components/pipeline-candidate-card";
import type { OngoingRecruitmentJob } from "@/features/hr/recruitment/ongoing-recruitment/types";

type WaitlistedTabProps = {
  job: OngoingRecruitmentJob;
};

export function WaitlistedTab({ job }: WaitlistedTabProps) {
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);

  function handleMoveToShortlist(candidateId: string) {
    console.log("rejectedAction", {
      jobId: job.id,
      candidateId,
      action: "move_to_shortlist",
    });
  }

  function handleMoveToInterview(candidateId: string) {
    console.log("rejectedAction", {
      jobId: job.id,
      candidateId,
      action: "move_to_interview",
    });
  }

  const selectedCandidate = job.waitlisted.find((candidate) => candidate.id === selectedCandidateId) ?? null;

  return (
    <>
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-4">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-[6px] bg-black text-white">
            <UsersRound className="h-4 w-4" />
          </span>
          <p className="text-base font-medium tracking-[-0.3125px] text-black">Rejected</p>
        </div>

        <div className="max-h-[320px] overflow-y-auto pr-1 [scrollbar-color:#d4d4d8_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#d4d4d8] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1.5">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            {job.waitlisted.map((candidate) => (
              <PipelineCandidateCard
                key={candidate.id}
                candidate={candidate}
                variant="rejected"
                onMoveToShortlist={handleMoveToShortlist}
                onMoveToInterview={handleMoveToInterview}
                onClick={setSelectedCandidateId}
              />
            ))}
          </div>
        </div>
      </section>

      <CandidateDetailDialog
        candidate={selectedCandidate}
        job={job}
        open={selectedCandidate !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedCandidateId(null);
          }
        }}
      />
    </>
  );
}

