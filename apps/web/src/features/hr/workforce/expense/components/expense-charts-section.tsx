import type { ExpenseBreakdownItem, MonthlyExpensePoint } from "@/features/hr/workforce/expense/types";

import { ExpenseBreakdownCard } from "./expense-breakdown-card";
import { MonthlyExpenseTrendCard } from "./monthly-expense-trend-card";

type ExpenseChartsSectionProps = {
  breakdown: ExpenseBreakdownItem[];
  trend: MonthlyExpensePoint[];
};

export function ExpenseChartsSection({ breakdown, trend }: ExpenseChartsSectionProps) {
  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <ExpenseBreakdownCard data={breakdown} />
      <MonthlyExpenseTrendCard data={trend} />
    </section>
  );
}
