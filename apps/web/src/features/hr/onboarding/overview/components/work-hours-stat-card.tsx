import { CalendarDays, Clock3, TrendingUp } from "lucide-react";

import type { WorkHoursStat } from "@/features/hr/onboarding/overview/types";

type WorkHoursStatCardProps = {
  stat: WorkHoursStat;
};

function WorkHoursIcon({ icon }: { icon: WorkHoursStat["icon"] }) {
  if (icon === "clock-3") return <Clock3 className="h-4 w-4 text-primary" />;
  if (icon === "calendar-days") return <CalendarDays className="h-4 w-4 text-primary" />;
  return <TrendingUp className="h-4 w-4 text-primary" />;
}

export function WorkHoursStatCard({ stat }: WorkHoursStatCardProps) {
  return (
    <article className="rounded-[8px] bg-[#f3f3f3] p-4">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium tracking-[-0.1504px] text-black">{stat.label}</p>
        <WorkHoursIcon icon={stat.icon} />
      </div>

      <p className="mt-1 text-[34px] font-semibold leading-8 tracking-[0.0703px] text-primary">{stat.value}</p>
      <p className="mt-1 text-sm text-[#666]">Target: {stat.target}</p>

      <div className="mt-3">
        <div className="mb-1 flex items-center justify-between">
          <p className="text-xs font-medium text-black">Performance</p>
          <p className="text-xs font-semibold text-primary">{stat.performance}</p>
        </div>
        <div className="h-1.5 rounded-full bg-[#dbe7ff]">
          <div className="h-full w-full rounded-full bg-primary" />
        </div>
      </div>
    </article>
  );
}

