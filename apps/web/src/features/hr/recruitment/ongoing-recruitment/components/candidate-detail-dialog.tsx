"use client";

import { Bot } from "lucide-react";

import type { OngoingPipelineCandidate } from "@/features/hr/recruitment/ongoing-recruitment/types";
import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";

type CandidateDetailDialogProps = {
  candidate: OngoingPipelineCandidate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function isLinkLike(type: OngoingPipelineCandidate["answers"][number]["type"]) {
  return type === "link" || type === "file";
}

export function CandidateDetailDialog({ candidate, open, onOpenChange }: CandidateDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-hidden p-0 sm:max-w-[1040px]">
        <DialogHeader className="border-b border-[#e5e5e5] px-6 py-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <DialogTitle className="text-[22px] tracking-[-0.4px]">{candidate?.fullName ?? "Applicant Detail"}</DialogTitle>
              <DialogDescription>{candidate?.listedAt ?? ""}</DialogDescription>
            </div>

            {candidate ? (
              <div className="min-w-[170px] rounded-[10px] border border-primary/20 bg-primary/5 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-primary">AI Score</p>
                <div className="mt-1 flex items-center gap-2">
                  <Bot className="h-4 w-4 text-primary" />
                  <p className="text-sm font-medium text-black">{candidate.aiAnalysis.score}%</p>
                </div>
              </div>
            ) : null}
          </div>
        </DialogHeader>

        {candidate ? (
          <div className="grid max-h-[calc(90vh-108px)] gap-0 overflow-hidden lg:grid-cols-[1.15fr_0.85fr]">
            <div className="overflow-y-auto border-b border-[#e5e5e5] px-6 py-5 [scrollbar-color:#d4d4d8_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#d4d4d8] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1.5 lg:border-b-0 lg:border-r">
              <div className="space-y-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-primary">Application Answers</p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {candidate.answers.map((answer) => (
                    <div key={answer.id} className="rounded-[12px] border border-[#e5e5e5] bg-white p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-primary">{answer.label}</p>

                      {isLinkLike(answer.type) ? (
                        <div className="mt-3">
                          <Button asChild type="button" variant="outline" size="sm" className="h-8 px-3 text-xs">
                            <a href={answer.value} target="_blank" rel="noreferrer">
                              Click to See
                            </a>
                          </Button>
                        </div>
                      ) : (
                        <p className="mt-3 text-sm leading-6 text-black">{answer.value}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="overflow-y-auto px-6 py-5 [scrollbar-color:#d4d4d8_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#d4d4d8] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1.5">
              <div className="space-y-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-primary">AI Analysis</p>
                  <p className="mt-1 text-sm text-[#666]">{candidate.aiAnalysis.summary}</p>
                </div>

                <div className="rounded-[12px] border border-[#e5e5e5] bg-white p-4">
                  <p className="text-xs font-medium uppercase text-primary">Strengths</p>
                  <ul className="mt-3 space-y-2 text-sm text-black">
                    {candidate.aiAnalysis.strengths.map((item) => (
                      <li key={item} className="rounded-[8px] bg-[#fafafa] px-3 py-2">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-[12px] border border-[#e5e5e5] bg-white p-4">
                  <p className="text-xs font-medium uppercase text-primary">Concerns</p>
                  <ul className="mt-3 space-y-2 text-sm text-black">
                    {candidate.aiAnalysis.concerns.map((item) => (
                      <li key={item} className="rounded-[8px] bg-[#fafafa] px-3 py-2">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-[12px] border border-primary/20 bg-primary/5 p-4">
                  <p className="text-xs font-medium uppercase text-primary">Recommendation</p>
                  <p className="mt-3 text-sm leading-6 text-black">{candidate.aiAnalysis.recommendation}</p>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
