import { AlertTriangle } from "lucide-react";

import type { DisciplineActionCase } from "@/features/hr/talent/discipline/types";
import { Card, CardContent } from "@/shared/components/ui/card";

import { DisciplineActionCaseCard } from "./discipline-action-case-card";

type DisciplineActionRequiredProps = {
  items: DisciplineActionCase[];
};

export function DisciplineActionRequired({ items }: DisciplineActionRequiredProps) {
  return (
    <Card className="gap-0 rounded-[10px] border-[#e7000b] py-0 shadow-none">
      <CardContent className="space-y-3 p-3">
        <div>
          <p className="inline-flex items-center gap-1.5 text-sm font-semibold tracking-[-0.3125px] text-[#e7000b]">
            <AlertTriangle className="h-3.5 w-3.5" />
            Discipline Action Required
          </p>
          <p className="text-xs text-[#666]">
            2 employees have active discipline tags requiring immediate review and action.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          {items.map((item) => (
            <DisciplineActionCaseCard key={item.id} item={item} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
