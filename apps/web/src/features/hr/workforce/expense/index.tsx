import {
  expenseBreakdown,
  expenseHistory,
  expenseRequests,
  expenseStats,
  monthlyExpenseTrend,
  recentExpenses,
  unexpectedExpenses,
} from '@/features/hr/workforce/expense/mock-data';
import {
  ExpenseChartsSection,
  ExpenseHistorySection,
  ExpenseRequestsSection,
  ExpenseStatsGrid,
  RecentExpensesSection,
  UnexpectedExpensesSection,
} from '@/features/hr/workforce/expense/components';

export * from '@/features/hr/workforce/expense/components';
export * from '@/features/hr/workforce/expense/types';

export function WorkforceExpenseContent() {
  return (
    <main className="mx-auto w-full max-w-[1024px] space-y-4 px-4 py-4 md:px-5 md:py-5">
      <ExpenseStatsGrid items={expenseStats} />
      <ExpenseChartsSection
        breakdown={expenseBreakdown}
        trend={monthlyExpenseTrend}
      />
      <ExpenseRequestsSection items={expenseRequests} />
      <RecentExpensesSection items={recentExpenses} />
      <UnexpectedExpensesSection items={unexpectedExpenses} />
      <ExpenseHistorySection items={expenseHistory} />
    </main>
  );
}
