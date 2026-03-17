import { Clock3, Star, Target, TrendingUp } from "lucide-react";

import type { PerformanceStatItem } from "@/features/hr/performance/overview/types";
import { Card, CardContent } from "@/shared/components/ui/card";

type StatsCardProps = PerformanceStatItem;

function IconByType({ icon }: { icon: PerformanceStatItem["icon"] }) {
  if (icon === "trending-up") return <TrendingUp className="h-4 w-4 text-primary" />;
  if (icon === "star") return <Star className="h-4 w-4 text-primary" />;
  if (icon === "target") return <Target className="h-4 w-4 text-primary" />;
  return <Clock3 className="h-4 w-4 text-primary" />;
}

export function StatsCard({ label, value, delta, icon }: StatsCardProps) {
  return (
    <Card className="gap-0 rounded-[10px] border-border py-0 shadow-none">
      <CardContent className="p-4 md:p-5">
        <div className="flex items-center justify-between gap-2">
          <IconByType icon={icon} />
          <span className="rounded-[4px] border border-primary px-1.5 py-0.5 text-[9px] font-medium text-primary">
            {delta}
          </span>
        </div>
        <p className="mt-2 text-[11px] text-[#666]">{label}</p>
        <p className="mt-1 text-[30px] font-semibold leading-8 tracking-[0.0703px] text-black">{value}</p>
      </CardContent>
    </Card>
  );
}
