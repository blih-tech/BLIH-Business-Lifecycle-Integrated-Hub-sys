import { DollarSign, HeartPulse, Users } from "lucide-react";

import type { BenefitsStat } from "@/features/hr/workforce/benefits/types";
import { Card, CardContent } from "@/shared/components/ui/card";

type BenefitsStatsGridProps = {
  items: BenefitsStat[];
};

export function BenefitsStatsGrid({ items }: BenefitsStatsGridProps) {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      {items.map((item) => (
        <Card key={item.id} className="gap-0 rounded-[12px] border-border py-0 shadow-none">
          <CardContent className="flex items-center justify-between px-4 py-6">
            <div className="space-y-1">
              <p className="text-sm leading-5 tracking-[-0.1504px] text-[#666]">{item.label}</p>
              <p className="text-[24px] font-semibold leading-8 tracking-[0.0703px] text-black">{item.value}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="inline-flex h-[22px] items-center rounded-[6px] bg-[#eaf2ff] px-2 text-[12px] font-medium text-primary">
                {item.trend}
              </div>
              <div className="text-primary">{renderIcon(item.icon)}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}

function renderIcon(icon: BenefitsStat["icon"]) {
  if (icon === "average") {
    return <HeartPulse className="h-5 w-5" />;
  }
  if (icon === "enrollments") {
    return <Users className="h-5 w-5" />;
  }
  return <DollarSign className="h-5 w-5" />;
}
