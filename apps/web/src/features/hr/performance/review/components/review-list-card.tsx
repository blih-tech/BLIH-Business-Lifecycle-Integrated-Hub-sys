import type { ReviewRow } from '@/features/hr/performance/review/types';
import { Card, CardContent } from '@/shared/components/ui/card';

import { ReviewItem } from './review-item';

type ReviewListCardProps = {
  rows: ReviewRow[];
};

export function ReviewListCard({ rows }: ReviewListCardProps) {
  return (
    <Card className="gap-0 rounded-[10px] border-border py-0 shadow-none">
      <CardContent className="p-3 md:p-4">
        <p className="mb-4 text-sm text-black">
          Performance Reviews ({rows.length})
        </p>
        <div className="space-y-2.5">
          {rows.map((row) => (
            <ReviewItem key={row.id} review={row} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
