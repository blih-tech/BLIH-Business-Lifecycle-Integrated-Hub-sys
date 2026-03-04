import { CalendarDays, SquareCheckBig } from "lucide-react";

import type { ChecklistStat } from "@/features/hr/onboarding/overview/types";

type ChecklistStatCardProps = {
  stat: ChecklistStat;
};

function ChecklistIcon({ icon }: { icon: ChecklistStat["icon"] }) {
  if (icon === "calendar-days") return <CalendarDays className="h-5 w-5 text-primary" />;
  return <SquareCheckBig className="h-5 w-5 text-primary" />;
}

export function ChecklistStatCard({ stat }: ChecklistStatCardProps) {
  return (
    <article className="rounded-[12px] border border-[#e5e5e5] bg-white px-6 py-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm tracking-[-0.1504px] text-[#666]">{stat.label}</p>
          <p className="mt-1 text-[32px] font-semibold leading-8 tracking-[0.0703px] text-black">{stat.value}</p>
        </div>
        <ChecklistIcon icon={stat.icon} />
      </div>
    </article>
  );
}

