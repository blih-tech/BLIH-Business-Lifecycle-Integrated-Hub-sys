import type { ActiveResignation } from "@/features/hr/exit/overview/types";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent } from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";

type ActiveResignationCardProps = {
  item: ActiveResignation;
};

export function ActiveResignationCard({ item }: ActiveResignationCardProps) {
  return (
    <Card className="gap-0 rounded-[10px] border-border py-0 shadow-none">
      <CardContent className="space-y-3 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-xs font-semibold text-white">
              {item.initials}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5">
                <p className="text-base font-semibold tracking-[-0.176px] text-black">{item.name}</p>
                <Badge variant="outline" className="h-5 rounded-[6px] px-2 text-[10px] font-medium text-black">
                  {item.department}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-[#666]">{item.role}</p>
            </div>
          </div>
          <Badge
            className={cn(
              "h-5 rounded-[6px] px-2 text-[10px] font-medium capitalize",
              item.status === "interview pending" || item.status === "clearance progress"
                ? "bg-primary text-white"
                : "bg-[#4a5565] text-white",
            )}
          >
            {item.status}
          </Badge>
        </div>
        <div className="grid gap-3 text-sm sm:grid-cols-3">
          <InfoBlock label="Resignation Date" value={item.resignationDate} />
          <InfoBlock label="Last Working Day" value={item.lastWorkingDay} />
          <InfoBlock label="Days Remaining" value={item.daysRemaining} />
        </div>
      </CardContent>
    </Card>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  const isDays = label === "Days Remaining";
  return (
    <div>
      <p className="text-xs text-[#666]">{label}</p>
      <p className={cn("text-sm font-semibold", isDays ? "text-primary" : "text-black")}>{value}</p>
    </div>
  );
}
