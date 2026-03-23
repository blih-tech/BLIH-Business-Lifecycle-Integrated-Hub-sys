import { AlertCircle, CheckCircle2, FileText, XCircle } from "lucide-react";

import type { ExitClearanceChecklistStat } from "@/features/hr/exit/clearance-checklist/types";
import { Card, CardContent } from "@/shared/components/ui/card";

type ClearanceChecklistStatsGridProps = {
  items: ExitClearanceChecklistStat[];
};

export function ClearanceChecklistStatsGrid({ items }: ClearanceChecklistStatsGridProps) {
  return (
    <section className="grid gap-3 md:grid-cols-4">
      {items.map((item) => (
        <Card key={item.id} className="gap-0 rounded-[10px] border-border py-0 shadow-none">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-[#666]">{item.label}</p>
                <p className="mt-1 text-[33px] font-semibold leading-8 tracking-[-0.3125px] text-black">{item.value}</p>
              </div>
              <div className="text-primary">{renderStatIcon(item.icon)}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}

function renderStatIcon(icon: ExitClearanceChecklistStat["icon"]) {
  if (icon === "completed") {
    return <CheckCircle2 className="h-4 w-4" />;
  }

  if (icon === "in-progress") {
    return <AlertCircle className="h-4 w-4" />;
  }

  if (icon === "pending") {
    return <XCircle className="h-4 w-4" />;
  }

  return <FileText className="h-4 w-4" />;
}
