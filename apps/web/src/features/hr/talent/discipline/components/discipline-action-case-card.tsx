import { Eye } from "lucide-react";

import type { DisciplineActionCase } from "@/features/hr/talent/discipline/types";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";

type DisciplineActionCaseCardProps = {
  item: DisciplineActionCase;
};

export function DisciplineActionCaseCard({ item }: DisciplineActionCaseCardProps) {
  return (
    <Card className="gap-0 rounded-[10px] border-border py-0 shadow-none">
      <CardContent className="space-y-3 p-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "grid h-8 w-8 place-items-center rounded-full text-[10px] font-semibold text-white",
                item.priority === "high" ? "bg-[#e7000b]" : "bg-primary",
              )}
            >
              {item.initials}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-semibold text-black">{item.name}</p>
                <span className="rounded-[4px] border border-border px-1.5 py-0.5 text-[9px] text-black">{item.department}</span>
              </div>
              <p className="text-xs text-[#666]">Issue Date: {item.issueDate}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[4px] bg-[#f3f3f3] p-2">
          <div className="mb-1 flex items-center justify-between">
            <p className={cn("text-xs font-semibold", item.priority === "high" ? "text-[#e7000b]" : "text-primary")}>
              {item.issueTitle}
            </p>
            <span
              className={cn(
                "rounded-[4px] px-1.5 py-0.5 text-[9px] font-medium text-white",
                item.priority === "high" ? "bg-[#e7000b]" : "bg-primary",
              )}
            >
              {item.priority}
            </span>
          </div>
          <p className="text-xs text-[#666]">{item.description}</p>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs text-[#666]">Discipline Score</p>
          <p className="text-[24px] font-semibold leading-6 tracking-[-0.3125px] text-black">{item.score}</p>
        </div>

        <Button className="h-8 w-full rounded-[6px] bg-[#e7000b] text-xs text-white hover:bg-[#c50009]">
          <Eye className="h-3.5 w-3.5" />
          Review Case
        </Button>
      </CardContent>
    </Card>
  );
}
