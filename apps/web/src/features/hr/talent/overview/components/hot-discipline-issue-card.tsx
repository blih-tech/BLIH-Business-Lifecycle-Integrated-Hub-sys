import { AlertTriangle } from "lucide-react";

import type { HotDisciplineIssue } from "@/features/hr/talent/overview/types";
import { Card, CardContent } from "@/shared/components/ui/card";

type HotDisciplineIssueCardProps = {
  item: HotDisciplineIssue;
};

export function HotDisciplineIssueCard({ item }: HotDisciplineIssueCardProps) {
  return (
    <Card className="gap-0 rounded-[8px] border-[#e7000b] bg-[rgba(251,207,209,0.05)] py-0 shadow-none">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-[#e7000b]" />
            <p className="text-[10px] font-medium text-[#e7000b]">Current Hot Discipline Issue</p>
          </div>
          <p className="rounded-[4px] border border-[#e7000b] px-1.5 py-0.5 text-[10px] text-[#e7000b]">{item.trend}</p>
        </div>
        <div className="grid grid-cols-2 gap-y-2">
          <div>
            <p className="text-sm font-semibold text-black">{item.issue}</p>
            <p className="text-[11px] text-[#666]">{item.subtitle}</p>
          </div>
          <div className="justify-self-end text-right">
            <p className="text-[11px] text-[#666]">Total Cases</p>
            <p className="text-xs font-semibold text-black">{item.totalCases}</p>
          </div>
          <div>
            <p className="text-[11px] text-[#666]">Total cases this month</p>
            <p className="text-xs font-semibold text-black">{item.monthlyCases}</p>
          </div>
          <div className="justify-self-end text-right">
            <p className="text-[11px] text-[#666]">Resolved</p>
            <p className="text-xs font-semibold text-black">{item.resolved}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
