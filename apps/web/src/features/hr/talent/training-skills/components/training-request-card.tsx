import { CircleCheck, CircleX } from "lucide-react";

import type { TrainingRequest } from "@/features/hr/talent/training-skills/types";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";

type TrainingRequestCardProps = {
  item: TrainingRequest;
};

export function TrainingRequestCard({ item }: TrainingRequestCardProps) {
  return (
    <Card className="gap-0 rounded-[10px] border-border py-0 shadow-none">
      <CardContent className="space-y-3 p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-start gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-xs font-semibold text-white">
              {item.initials}
            </div>
            <div className="min-w-0">
              <div className="mb-1 flex items-center gap-1.5">
                <p className="text-sm font-semibold tracking-[-0.3125px] text-black">{item.name}</p>
                <span className="rounded-[6px] border border-border px-2 py-0.5 text-xs text-black">{item.department}</span>
                <span className="rounded-[6px] bg-primary px-2 py-0.5 text-xs font-medium text-white">
                  {item.status}
                </span>
              </div>
              <p className="text-base font-medium leading-6 tracking-[-0.3125px] text-primary">{item.title}</p>
              <p className="mt-1 text-sm text-[#666]">Provider: {item.provider}</p>
            </div>
          </div>

          <div className="grid w-full grid-cols-3 bg-[#f3f3f3] xl:w-[367px]">
            <Metric label="Cost" value={item.cost} isPrimary />
            <Metric label="Duration" value={item.duration} />
            <Metric label="Start Date" value={item.startDate} />
          </div>
        </div>

        <div className="grid gap-2 xl:grid-cols-[1fr_367px] xl:gap-5">
          <div className="rounded-[4px] border border-[#e3e3e3] bg-[#dbe6fb] px-[11px] py-[11px] text-sm text-[rgba(0,0,0,0.7)]">
            <span className="font-medium text-black">Justification:</span> {item.justification}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button size="sm" className="h-10 rounded-[6px] text-sm">
              <CircleCheck className="h-4 w-4" />
              Approve
            </Button>
            <Button size="sm" variant="outline" className="h-10 rounded-[6px] border-border bg-white text-sm text-black">
              <CircleX className="h-4 w-4" />
              Reject
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Metric({
  label,
  value,
  isPrimary,
}: {
  label: string;
  value: string;
  isPrimary?: boolean;
}) {
  return (
    <div className="px-2 py-2">
      <p className="text-xs text-[#666]">{label}</p>
      <p className={`text-base font-semibold leading-6 tracking-[-0.3125px] ${isPrimary ? "text-primary" : "text-black"}`}>
        {value}
      </p>
    </div>
  );
}
