import type { ProfitSharingTier } from "@/features/hr/workforce/benefits/types";

type ProfitSharingTierRowProps = {
  item: ProfitSharingTier;
};

export function ProfitSharingTierRow({ item }: ProfitSharingTierRowProps) {
  return (
    <div className="rounded-[12px] border border-[#e5e5e5] bg-white px-4 py-3">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="rounded-[6px] bg-[#f3f3f3] px-2 py-1 text-xs font-medium text-black">{item.label}</span>
          <span className="text-xs text-[#666]">{item.employees}</span>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-black">{item.amount}</p>
          <p className="text-[11px] text-[#666]">{item.average}</p>
        </div>
      </div>
      <div className="mt-3 h-2 w-full rounded-full bg-[#e5e5e5]">
        <div className="h-2 rounded-full bg-primary" style={{ width: `${item.utilization}%` }} />
      </div>
    </div>
  );
}
