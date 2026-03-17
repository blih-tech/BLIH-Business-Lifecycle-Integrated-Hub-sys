import { Eye } from "lucide-react";

import type { ReviewRow } from "@/features/hr/performance/review/types";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

type ReviewItemProps = {
  review: ReviewRow;
};

export function ReviewItem({ review }: ReviewItemProps) {
  return (
    <div className="flex items-center justify-between rounded-[8px] border border-border bg-white px-3 py-2.5">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="grid h-8 w-8 place-items-center rounded-full bg-primary text-[10px] font-semibold text-white">
          {review.initials}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-black">{review.name}</p>
          <p className="text-xs text-[#666]">{review.department}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Metric label="KPI Score" value={`${review.kpi}%`} />
        <Metric label="OKR" value={`${review.okr}%`} />
        <Metric label="Score" value={`${review.score.toFixed(1)}/5.0`} />
        <span
          className={cn(
            "inline-flex h-[22px] items-center justify-center rounded-[6px] px-2.5 text-[10px] font-medium text-white",
            review.status === "completed" ? "bg-primary" : "bg-[#4a5565]",
          )}
        >
          {review.status === "completed" ? "Completed" : "In Progress"}
        </span>
        <Button variant="outline" className="h-8 rounded-[6px] border-border bg-white px-3 text-xs text-black">
          <Eye className="mr-1 h-3.5 w-3.5" />
          View
        </Button>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] text-[#666]">{label}</p>
      <p className="text-sm font-semibold text-primary">{value}</p>
    </div>
  );
}
