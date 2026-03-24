import {
  annualBudgets,
  budgetAllocations,
  budgetStats,
  departmentBudgetPoints,
} from '@/features/hr/workforce/budget/mock-data';
import {
  AnnualBudgetsSection,
  BudgetAllocationsSection,
  BudgetManagementCard,
  BudgetStatsGrid,
  DepartmentBudgetSpendingCard,
} from '@/features/hr/workforce/budget/components';

export * from '@/features/hr/workforce/budget/components';
export * from '@/features/hr/workforce/budget/types';

export function WorkforceBudgetContent() {
  return (
    <main className="mx-auto w-full max-w-[1024px] space-y-4 px-4 py-4 md:px-5 md:py-5">
      <BudgetStatsGrid items={budgetStats} />
      <BudgetManagementCard />
      <DepartmentBudgetSpendingCard data={departmentBudgetPoints} />
      <BudgetAllocationsSection items={budgetAllocations} />
      <AnnualBudgetsSection items={annualBudgets} />
    </main>
  );
}
