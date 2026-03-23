import type { ProfitSharingSummary, ProfitSharingTier } from "@/features/hr/workforce/benefits/types";
import { Card, CardContent } from "@/shared/components/ui/card";

import { ProfitSharingTierRow } from "./profit-sharing-tier-row";

type AnnualProfitSharingSectionProps = {
  summaries: ProfitSharingSummary[];
  tiers: ProfitSharingTier[];
};

export function AnnualProfitSharingSection({ summaries, tiers }: AnnualProfitSharingSectionProps) {
  return (
    <Card className="gap-0 rounded-[12px] border-border py-0 shadow-none">
      <CardContent className="space-y-4 p-4">
        <p className="text-sm font-medium tracking-[-0.176px] text-black">Annual Profit Sharing</p>

        <div className="grid gap-4 md:grid-cols-3">
          {summaries.map((summary) => (
            <div key={summary.id} className="rounded-[12px] border border-[#e5e5e5] bg-white px-4 py-3 text-center">
              <p className="text-xs text-[#666]">{summary.label}</p>
              <p className="mt-1 text-lg font-semibold tracking-[0.0703px] text-black">{summary.value}</p>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-black">Distribution by Tier</p>
          <div className="grid gap-3 md:grid-cols-2">
            {tiers.map((tier) => (
              <ProfitSharingTierRow key={tier.id} item={tier} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
