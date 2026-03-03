import { CircleCheckBig, Clock3, TrendingUp } from "lucide-react";

import type { AttendanceStatItem } from "@/features/hr/attendance/overview/types";
import { Card, CardContent } from "@/shared/components/ui/card";

type StatsCardProps = AttendanceStatItem;

function StatIcon({ icon }: { icon: AttendanceStatItem["icon"] }) {
  if (icon === "clock-3") return <Clock3 className="h-4 w-4 text-primary" />;
  if (icon === "circle-check-big") return <CircleCheckBig className="h-4 w-4 text-primary" />;
  return <TrendingUp className="h-4 w-4 text-primary" />;
}

export function StatsCard({ label, value, icon }: StatsCardProps) {
  return (
    <Card className="gap-0 rounded-[10px] border-border py-0 shadow-none">
      <CardContent className="p-4 md:p-5">
        <div className="flex items-start justify-between">
          <p className="ui-label text-[#666]">{label}</p>
          <StatIcon icon={icon} />
        </div>
        <p className="mt-1 text-[35px] font-semibold leading-9 tracking-[0.0703px] text-black">{value}</p>
      </CardContent>
    </Card>
  );
}
