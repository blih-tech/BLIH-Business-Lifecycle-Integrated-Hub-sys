import type {
  RecommendationPriority,
  TrainingRecommendation,
} from "@/features/hr/talent/training-skills/types";
import { Card, CardContent } from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";

type RecommendationCardProps = {
  item: TrainingRecommendation;
};

const priorityLabel: Record<RecommendationPriority, string> = {
  high: "high priority",
  medium: "medium priority",
  low: "low priority",
};

export function RecommendationCard({ item }: RecommendationCardProps) {
  return (
    <Card className="gap-0 rounded-[10px] border-border py-0 shadow-none">
      <CardContent className="space-y-2.5 p-3">
        <div className="flex items-center gap-1.5">
          <p className="text-base font-semibold text-black">{item.title}</p>
          <span className="rounded-[4px] border border-border px-1.5 py-0.5 text-[9px] text-black">{item.department}</span>
          <span
            className={cn(
              "rounded-[4px] px-1.5 py-0.5 text-[9px] font-medium text-white",
              item.priority === "high"
                ? "bg-[#e7000b]"
                : item.priority === "medium"
                  ? "bg-primary"
                  : "bg-[#4a5565]",
            )}
          >
            {priorityLabel[item.priority]}
          </span>
        </div>

        <p className="text-sm text-[#666]">Affects {item.affectsCount} employees</p>

        <div className="rounded-[4px] bg-[#dbe6fb] p-2">
          <p className="text-xs font-medium text-primary">AI Recommendation</p>
          <p className="mt-0.5 text-xs text-black">{item.recommendation}</p>
        </div>
      </CardContent>
    </Card>
  );
}
