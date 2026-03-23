import type { ExpenseHistoryItem } from '@/features/hr/workforce/expense/types';
import { Card, CardContent } from '@/shared/components/ui/card';

import { ExpenseHistoryCard } from './expense-history-card';

type ExpenseHistorySectionProps = {
  items: ExpenseHistoryItem[];
};

export function ExpenseHistorySection({ items }: ExpenseHistorySectionProps) {
  return (
    <Card className="gap-0 rounded-[12px] border-border py-0 shadow-none">
      <CardContent className="space-y-4 p-4">
        <p className="text-base tracking-[-0.3125px] text-black">
          Expense History
        </p>
        <div className="space-y-4">
          {items.map((item) => (
            <ExpenseHistoryCard key={item.id} item={item} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
