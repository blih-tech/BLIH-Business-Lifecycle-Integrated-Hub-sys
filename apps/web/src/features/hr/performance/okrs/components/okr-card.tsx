import { CalendarDays, ChevronDown, ChevronUp, Sparkles } from "lucide-react";

import type { OkrItem } from "@/features/hr/performance/okrs/types";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";

type OkrCardProps = {
  item: OkrItem;
  isExpanded: boolean;
  onToggle: (id: string) => void;
};

export function OkrCard({ item, isExpanded, onToggle }: OkrCardProps) {
  return (
    <Card className="gap-0 rounded-[10px] border-border py-0 shadow-none">
      <CardContent className="p-0">
        <div className="flex items-start justify-between px-4 py-3">
          <div className="min-w-0">
            <div className="mb-1 flex items-center gap-1.5">
              <span className="rounded-[4px] bg-primary px-2 py-0.5 text-[10px] font-medium text-white">{item.department}</span>
              <span className="rounded-[4px] border border-[#4a5565] px-2 py-0.5 text-[10px] text-[#4a5565]">{item.status}</span>
            </div>
            <p className="text-[20px] font-medium tracking-[-0.3125px] text-black">{item.title}</p>
            <div className="mt-1 flex items-center gap-3 text-xs text-[#666]">
              <span>Owner: {item.owner}</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-3 w-3" />
                {item.dateRange}
              </span>
            </div>
          </div>

          <div className="text-right">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-auto cursor-pointer gap-1 p-0 text-xs font-medium tracking-[-0.1504px] text-primary hover:bg-transparent hover:text-primary"
              onClick={() => onToggle(item.id)}
              aria-expanded={isExpanded}
            >
              {isExpanded ? <ChevronUp className="h-[14px] w-[14px]" /> : <ChevronDown className="h-[14px] w-[14px]" />}
              {isExpanded ? "Less" : "More"}
            </Button>
            <p className="mt-1 text-[32px] font-bold leading-8 text-primary">{item.overallScore}%</p>
            <p className="text-[11px] text-[#666]">Overall Score</p>
          </div>
        </div>

        <div
          className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
            isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="grid grid-cols-1 gap-4 border-t border-border px-4 py-4 lg:grid-cols-2">
            <div>
              <p className="mb-2 text-sm font-semibold text-black">Key Results</p>
              <div className="space-y-3">
                {item.keyResults.map((result) => (
                  <div key={result.id}>
                    <div className="mb-1 flex items-center justify-between text-xs text-[#666]">
                      <span>{result.label}</span>
                      <span>{result.value}%</span>
                    </div>
                    <div className="h-[6px] w-full rounded-full bg-[#dbe6fb]">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${result.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-base font-semibold text-black">Overall Score</p>
                  <p className="text-[30px] font-bold leading-7 text-primary">{item.overallScore}%</p>
                </div>
                <div className="rounded-[8px] border border-primary bg-white p-3">
                  <p className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                    <Sparkles className="h-3.5 w-3.5" />
                    AI Summary
                  </p>
                  <p className="mt-1 text-xs text-[#666]">{item.aiSummary}</p>
                </div>
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-black">Key Impacts</p>
              <div className="space-y-1.5">
                {item.keyImpacts.map((impact) => (
                  <div key={impact} className="rounded-[6px] bg-[#f3f3f3] px-2.5 py-2 text-xs text-black">
                    {impact}
                  </div>
                ))}
              </div>
            </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
