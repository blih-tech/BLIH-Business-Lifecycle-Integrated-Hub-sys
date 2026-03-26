import { CircleCheckBig, Clock3, UserRoundPlus } from "lucide-react";

import type { RecruitmentStatItem } from "@/features/hr/recruitment/overview/types";

type StatsCardProps = RecruitmentStatItem;

function IconByType({ icon }: { icon: RecruitmentStatItem["icon"] }) {
  if (icon === "clock-3") return <Clock3 className="h-4 w-4 text-primary" />;
  if (icon === "circle-check-big") return <CircleCheckBig className="h-4 w-4 text-primary" />;
  return <UserRoundPlus className="h-4 w-4 text-primary" />;
}

export function StatsCard({ label, value, icon }: StatsCardProps) {
  return (
    <article className="ui-surface p-4 md:p-5">
      <div className="flex items-start justify-between">
        <p className="ui-label text-xs">{label}</p>
        <IconByType icon={icon} />
      </div>
      <p className="mt-1 text-[28px] font-semibold leading-7 tracking-[0.02em] text-black">{value}</p>
    </article>
  );
}
