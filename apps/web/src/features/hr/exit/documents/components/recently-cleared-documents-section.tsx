import type { RecentlyClearedItem } from '@/features/hr/exit/documents/types';
import { Card, CardContent } from '@/shared/components/ui/card';

import { RecentlyClearedDocumentCard } from './recently-cleared-document-card';

type RecentlyClearedDocumentsSectionProps = {
  items: RecentlyClearedItem[];
};

export function RecentlyClearedDocumentsSection({
  items,
}: RecentlyClearedDocumentsSectionProps) {
  return (
    <Card className="gap-0 rounded-[12px] border-border py-0 shadow-none">
      <CardContent className="space-y-4 p-4">
        <p className="text-base font-medium tracking-[-0.176px] text-black">
          Recently Cleared Documents
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          {items.map((item) => (
            <RecentlyClearedDocumentCard key={item.id} item={item} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
