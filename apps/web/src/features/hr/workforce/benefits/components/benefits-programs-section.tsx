import type { BenefitsProgram } from "@/features/hr/workforce/benefits/types";
import { Card, CardContent } from "@/shared/components/ui/card";

import { BenefitsProgramCard } from "./benefits-program-card";

type BenefitsProgramsSectionProps = {
  items: BenefitsProgram[];
};

export function BenefitsProgramsSection({ items }: BenefitsProgramsSectionProps) {
  return (
    <Card className="gap-0 rounded-[12px] border-border py-0 shadow-none">
      <CardContent className="space-y-4 p-4">
        <p className="text-sm font-medium tracking-[-0.176px] text-black">Other Benefits Programs</p>
        <div className="grid gap-4 md:grid-cols-3">
          {items.map((item) => (
            <BenefitsProgramCard key={item.id} item={item} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
