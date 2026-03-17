import { AlertTriangle, CalendarClock, FileClock, UserRoundX } from "lucide-react";

import type { ExitOverviewStat } from "@/features/hr/exit/overview/types";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent } from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";

type ExitOverviewStatCardProps = {
  item: ExitOverviewStat;
};

export function ExitOverviewStatCard({ item }: ExitOverviewStatCardProps) {
  return (
    <Card className="gap-0 rounded-[10px] border-border py-0 shadow-none">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <div className="grid h-9 w-9 place-items-center rounded-[8px] border border-border bg-white text-primary">
            {renderIcon(item.icon)}
          </div>
          <Badge
            variant="outline"
            className={cn(
              "h-5 rounded-[6px] px-2 text-[10px] font-medium",
              item.badgeTone === "danger"
                ? "border-[#e7000b]/30 bg-[#fbebeb] text-[#e7000b]"
                : item.badgeTone === "neutral"
                  ? "border-[#4a5565]/30 bg-[#f5f6f7] text-[#4a5565]"
                  : "border-primary/30 bg-[#dbe6fb] text-primary",
            )}
          >
            {item.badge}
          </Badge>
        </div>
        <div>
          <p className="text-sm text-[#666]">{item.label}</p>
          <p className="text-[30px] font-semibold leading-8 tracking-[0.0703px] text-black">{item.value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function renderIcon(icon: ExitOverviewStat["icon"]) {
  if (icon === "interview") {
    return <CalendarClock className="h-4 w-4" />;
  }
  if (icon === "clearance") {
    return <AlertTriangle className="h-4 w-4" />;
  }
  if (icon === "completed") {
    return <FileClock className="h-4 w-4" />;
  }
  return <UserRoundX className="h-4 w-4" />;
}
