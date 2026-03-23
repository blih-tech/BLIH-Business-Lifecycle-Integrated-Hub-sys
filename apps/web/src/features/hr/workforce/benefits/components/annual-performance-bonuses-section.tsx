import type { PerformanceBonusSummary, TopRecipient } from "@/features/hr/workforce/benefits/types";
import { Card, CardContent } from "@/shared/components/ui/card";

import { TopRecipientCard } from "./top-recipient-card";

type AnnualPerformanceBonusesSectionProps = {
  summaries: PerformanceBonusSummary[];
  recipients: TopRecipient[];
};

export function AnnualPerformanceBonusesSection({ summaries, recipients }: AnnualPerformanceBonusesSectionProps) {
  return (
    <Card className="gap-0 rounded-[12px] border-border py-0 shadow-none">
      <CardContent className="space-y-4 p-4">
        <p className="text-sm font-medium tracking-[-0.176px] text-black">Annual Performance Bonuses</p>

        <div className="grid gap-3 md:grid-cols-3">
          {summaries.map((summary) => (
            <div key={summary.id} className="rounded-[12px] border border-[#e5e5e5] bg-white px-3 py-2 text-center">
              <p className="text-xs text-[#666]">{summary.label}</p>
              <p className="mt-1 text-base font-semibold text-black">{summary.value}</p>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-black">Top Recipients</p>
          <div className="grid gap-3 md:grid-cols-2">
            {recipients.map((recipient) => (
              <TopRecipientCard key={recipient.id} item={recipient} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
