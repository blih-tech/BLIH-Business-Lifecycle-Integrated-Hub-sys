import { ChevronRight } from "lucide-react";

import type { PreviousPromotionRequest } from "@/features/hr/talent/career/types";
import { Button } from "@/shared/components/ui/button";

import { PreviousPromotionCard } from "./previous-promotion-card";

type PreviousPromotionSectionProps = {
  items: PreviousPromotionRequest[];
};

export function PreviousPromotionSection({ items }: PreviousPromotionSectionProps) {
  return (
    <section className="space-y-3">
      <p className="text-base font-medium tracking-[-0.176px] text-black">Previous Promotion Requests</p>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {items.map((item) => (
          <PreviousPromotionCard key={item.id} item={item} />
        ))}
      </div>
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" className="h-auto cursor-pointer gap-1 p-0 text-xs font-normal text-[#666] hover:bg-transparent hover:text-[#666]">
          See More
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </section>
  );
}
