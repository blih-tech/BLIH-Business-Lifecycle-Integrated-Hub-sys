import { CheckCircle2, Clock3, Users } from "lucide-react";

import type { OnboardingSummaryStat } from "@/features/hr/onboarding/overview/types";

type SummaryStatCardProps = {
  stat: OnboardingSummaryStat;
};

function SummaryIcon({ icon }: { icon: OnboardingSummaryStat["icon"] }) {
  if (icon === "users") return <Users className="h-5 w-5 text-primary" />;
  if (icon === "check-circle") return <CheckCircle2 className="h-5 w-5 text-primary" />;
  return <Clock3 className="h-5 w-5 text-primary" />;
}

export function SummaryStatCard({ stat }: SummaryStatCardProps) {
  return (
    <article className="rounded-[12px] border border-[#e5e5e5] bg-white px-6 py-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm tracking-[-0.1504px] text-[#666]">{stat.label}</p>
          <p className="mt-1 text-[32px] font-semibold leading-8 tracking-[0.0703px] text-black">{stat.value}</p>
        </div>
        <SummaryIcon icon={stat.icon} />
      </div>
    </article>
  );
}

