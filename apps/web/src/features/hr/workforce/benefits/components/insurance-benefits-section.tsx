import type { InsuranceBenefitItem } from '@/features/hr/workforce/benefits/types';
import { Card, CardContent } from '@/shared/components/ui/card';

import { InsuranceBenefitCard } from './insurance-benefit-card';

type InsuranceBenefitsSectionProps = {
  totalLabel: string;
  totalValue: string;
  items: InsuranceBenefitItem[];
};

export function InsuranceBenefitsSection({
  totalLabel,
  totalValue,
  items,
}: InsuranceBenefitsSectionProps) {
  return (
    <Card className="gap-0 rounded-[12px] border-border py-0 shadow-none">
      <CardContent className="space-y-4 p-4">
        <p className="text-base tracking-[-0.3125px] text-black">
          Insurance Benefits
        </p>
        <div className="rounded-[8px] bg-[#eaf2ff] px-4 py-3 text-center">
          <p className="text-xs text-[#666]">{totalLabel}</p>
          <p className="text-[26px] font-bold tracking-[0.3955px] text-primary">
            {totalValue}
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <InsuranceBenefitCard key={item.id} item={item} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
