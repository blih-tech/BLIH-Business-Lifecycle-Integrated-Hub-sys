import type { UpcomingInterview } from '@/features/hr/exit/interviews/types';

import { UpcomingInterviewCard } from './upcoming-interview-card';

type UpcomingExitInterviewsSectionProps = {
  items: UpcomingInterview[];
};

export function UpcomingExitInterviewsSection({
  items,
}: UpcomingExitInterviewsSectionProps) {
  return (
    <section className="space-y-3">
      <p className="text-base font-medium tracking-[-0.176px] text-black">
        Upcoming Exit Interviews
      </p>
      <div className="grid gap-3 lg:grid-cols-2">
        {items.map((item) => (
          <UpcomingInterviewCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
