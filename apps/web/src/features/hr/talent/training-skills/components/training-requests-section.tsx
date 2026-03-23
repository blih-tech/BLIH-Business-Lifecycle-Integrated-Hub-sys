import type { TrainingRequest } from '@/features/hr/talent/training-skills/types';

import { TrainingRequestCard } from './training-request-card';

type TrainingRequestsSectionProps = {
  items: TrainingRequest[];
};

export function TrainingRequestsSection({
  items,
}: TrainingRequestsSectionProps) {
  return (
    <section className="space-y-3">
      <p className="text-base font-medium tracking-[-0.176px] text-black">
        Training Requests - Awaiting Approval ({items.length})
      </p>
      <div className="space-y-3">
        {items.map((item) => (
          <TrainingRequestCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
