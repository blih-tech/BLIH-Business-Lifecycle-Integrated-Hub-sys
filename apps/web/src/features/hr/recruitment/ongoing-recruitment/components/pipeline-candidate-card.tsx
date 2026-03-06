import { Bot, MoreHorizontal } from "lucide-react";

import type { OngoingPipelineCandidate } from "@/features/hr/recruitment/ongoing-recruitment/types";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

type PipelineCandidateCardProps = {
  candidate: OngoingPipelineCandidate;
  variant?: "default" | "shortlist" | "rejected";
  onMoveToInterview?: (candidateId: string) => void;
  onMoveToShortlist?: (candidateId: string) => void;
  onReject?: (candidateId: string) => void;
  onClick?: (candidateId: string) => void;
};

export function PipelineCandidateCard({
  candidate,
  variant = "default",
  onMoveToInterview,
  onMoveToShortlist,
  onReject,
  onClick,
}: PipelineCandidateCardProps) {
  return (
    <article
      className={`rounded-[14px] border border-[#e5e5e5] bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-colors hover:bg-[#fcfcfc] ${
        onClick ? "cursor-pointer" : ""
      }`}
      onClick={() => onClick?.(candidate.id)}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium leading-5 tracking-[-0.1504px] text-black">{candidate.fullName}</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex h-[24px] w-fit items-center gap-1 rounded-[6px] border border-primary/20 bg-primary/5 px-2 py-[3px] text-[10px] font-bold text-primary">
            <Bot className="h-3 w-3" />
            {candidate.rating}%
          </span>

          {variant !== "default" ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-[6px]"
                  onClick={(event) => event.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {variant === "shortlist" ? (
                  <>
                    <DropdownMenuItem
                      onClick={(event) => {
                        event.stopPropagation();
                        onMoveToInterview?.(candidate.id);
                      }}
                    >
                      Move to Interview
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={(event) => {
                        event.stopPropagation();
                        onReject?.(candidate.id);
                      }}
                    >
                      Reject
                    </DropdownMenuItem>
                  </>
                ) : null}

                {variant === "rejected" ? (
                  <>
                    <DropdownMenuItem
                      onClick={(event) => {
                        event.stopPropagation();
                        onMoveToShortlist?.(candidate.id);
                      }}
                    >
                      Move to Shortlist
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(event) => {
                        event.stopPropagation();
                        onMoveToInterview?.(candidate.id);
                      }}
                    >
                      Move to Interview
                    </DropdownMenuItem>
                  </>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-[#f0f0f0] pt-3">
        <p className="text-xs text-[#666]">{candidate.listedAt}</p>
      </div>
    </article>
  );
}

