import type { PromotionRequest } from "@/features/hr/talent/career/types";

import { PromotionRequestCard } from "./promotion-request-card";

type PromotionRequestsSectionProps = {
  items: PromotionRequest[];
};

export function PromotionRequestsSection({ items }: PromotionRequestsSectionProps) {
  return (
    <section className="space-y-3">
      <p className="text-base font-medium tracking-[-0.176px] text-black">
        Promotion Requests - Awaiting Approval ({items.length})
      </p>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {items.map((item) => (
          <PromotionRequestCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
