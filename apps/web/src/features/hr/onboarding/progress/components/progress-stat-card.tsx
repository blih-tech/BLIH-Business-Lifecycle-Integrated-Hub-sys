import type { ProgressSummaryStat } from "@/features/hr/onboarding/progress/types";
import type { ReactNode } from "react";

type ProgressStatCardProps = {
  stat: ProgressSummaryStat;
  icon?: ReactNode;
};

export function ProgressStatCard({ stat, icon }: ProgressStatCardProps) {
  return (
    <article className="rounded-[12px] border border-[#e5e5e5] bg-white px-6 py-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm tracking-[-0.1504px] text-[#666]">{stat.label}</p>
          <p className="mt-1 text-[32px] font-semibold leading-8 tracking-[0.0703px] text-black">{stat.value}</p>
        </div>
        {icon ? <div className="mt-1 text-primary">{icon}</div> : null}
      </div>
    </article>
  );
}
