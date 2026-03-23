import type { RecentExpenseItem } from '@/features/hr/workforce/expense/types';
import { Card, CardContent } from '@/shared/components/ui/card';

import { RecentExpenseCard } from './recent-expense-card';

type RecentExpensesSectionProps = {
  items: RecentExpenseItem[];
};

export function RecentExpensesSection({ items }: RecentExpensesSectionProps) {
  return (
    <Card className="gap-0 rounded-[12px] border-border py-0 shadow-none">
      <CardContent className="space-y-4 p-4">
        <p className="text-base tracking-[-0.3125px] text-black">
          Recent Expenses
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <RecentExpenseCard key={item.id} item={item} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
