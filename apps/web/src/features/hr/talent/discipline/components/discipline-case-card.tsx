import type { DisciplineCase } from "@/features/hr/talent/discipline/types";
import { Card, CardContent } from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";

type DisciplineCaseCardProps = {
  item: DisciplineCase;
};

export function DisciplineCaseCard({ item }: DisciplineCaseCardProps) {
  return (
    <Card className="gap-0 rounded-[10px] border-border py-0 shadow-none">
      <CardContent className="space-y-2 p-3">
        <div className="flex items-center gap-2">
          <div className="grid h-6 w-6 place-items-center rounded-full bg-primary text-[9px] font-semibold text-white">
            {item.initials}
          </div>
          <p className="text-xs font-semibold text-black">{item.name}</p>
        </div>
        <p className="text-xs text-[#666]">{item.issueType}</p>
        <p
          className={cn(
            "text-[22px] font-semibold leading-6 tracking-[-0.3125px]",
            item.scoreTone === "danger"
              ? "text-[#e7000b]"
              : item.scoreTone === "neutral"
                ? "text-[#4a5565]"
                : "text-primary",
          )}
        >
          {item.score}
        </p>
      </CardContent>
    </Card>
  );
}
