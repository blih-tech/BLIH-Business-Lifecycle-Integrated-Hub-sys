import type { AdditionalBenefitItem } from '@/features/hr/workforce/benefits/types';
import { Card, CardContent } from '@/shared/components/ui/card';

type AdditionalBenefitCardProps = {
  item: AdditionalBenefitItem;
};

export function AdditionalBenefitCard({ item }: AdditionalBenefitCardProps) {
  return (
    <Card className="gap-0 rounded-[12px] border-border py-0 shadow-none">
      <CardContent className="space-y-2 p-4">
        <p className="text-sm font-semibold tracking-[-0.2px] text-black">
          {item.title}
        </p>
        <div className="space-y-1 text-xs text-[#666]">
          <div className="flex items-center justify-between">
            <span>Budget:</span>
            <span className="font-medium text-black">{item.budget}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Participants:</span>
            <span className="font-medium text-primary">
              {item.participants}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
