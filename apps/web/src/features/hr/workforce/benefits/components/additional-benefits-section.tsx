import type { AdditionalBenefitItem } from '@/features/hr/workforce/benefits/types';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Heart } from 'lucide-react';

import { AdditionalBenefitCard } from './additional-benefit-card';

type AdditionalBenefitsSectionProps = {
  items: AdditionalBenefitItem[];
};

export function AdditionalBenefitsSection({
  items,
}: AdditionalBenefitsSectionProps) {
  return (
    <Card className="gap-0 rounded-[12px] border-border py-0 shadow-none">
      <CardContent className="space-y-4 p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#ffecec]">
            <Heart className="h-3.5 w-3.5 text-[#f36a6a]" />
          </div>
          <p className="text-base tracking-[-0.3125px] text-black">
            Additional Benefits &amp; Perks
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {items.map((item) => (
            <AdditionalBenefitCard key={item.id} item={item} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
