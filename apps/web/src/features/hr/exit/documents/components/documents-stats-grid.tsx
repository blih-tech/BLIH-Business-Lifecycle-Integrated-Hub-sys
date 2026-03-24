import type { ExitDocumentsStat } from '@/features/hr/exit/documents/types';

import { DocumentsStatsCard } from './documents-stats-card';

type DocumentsStatsGridProps = {
  items: ExitDocumentsStat[];
};

export function DocumentsStatsGrid({ items }: DocumentsStatsGridProps) {
  return (
    <section className="grid gap-3 md:grid-cols-3">
      {items.map((item) => (
        <DocumentsStatsCard key={item.id} item={item} />
      ))}
    </section>
  );
}
