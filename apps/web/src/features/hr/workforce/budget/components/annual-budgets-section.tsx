import type { AnnualBudgetItem } from '@/features/hr/workforce/budget/types';

import { AnnualBudgetCard } from './annual-budget-card';

type AnnualBudgetsSectionProps = {
  items: AnnualBudgetItem[];
};

export function AnnualBudgetsSection({ items }: AnnualBudgetsSectionProps) {
  return (
    <section className="space-y-3">
      <p className="text-sm font-medium tracking-[-0.176px] text-black">
        Previous Annual Budgets
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <AnnualBudgetCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
