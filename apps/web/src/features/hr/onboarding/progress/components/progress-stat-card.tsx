import type { ProgressSummaryStat } from "@/features/hr/onboarding/progress/types";

type ProgressStatCardProps = {
  stat: ProgressSummaryStat;
};

export function ProgressStatCard({ stat }: ProgressStatCardProps) {
  return (
    <article className="rounded-[12px] border border-[#e5e5e5] bg-white px-6 py-5">
      <p className="text-sm tracking-[-0.1504px] text-[#666]">{stat.label}</p>
      <p className="mt-1 text-[32px] font-semibold leading-8 tracking-[0.0703px] text-black">{stat.value}</p>
    </article>
  );
}

