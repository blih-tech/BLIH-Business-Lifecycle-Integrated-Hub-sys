import type { ExitInterviewStat } from '@/features/hr/exit/interviews/types';

import { InterviewStatsCard } from './interview-stats-card';

type InterviewStatsGridProps = {
  items: ExitInterviewStat[];
};

export function InterviewStatsGrid({ items }: InterviewStatsGridProps) {
  return (
    <section className="grid gap-3 md:grid-cols-3">
      {items.map((item) => (
        <InterviewStatsCard key={item.id} item={item} />
      ))}
    </section>
  );
}
