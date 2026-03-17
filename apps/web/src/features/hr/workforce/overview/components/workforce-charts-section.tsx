import type { DepartmentBudgetPoint, MonthlyPayrollPoint } from "@/features/hr/workforce/overview/types";

import { DepartmentBudgetUtilizationCard } from "./department-budget-utilization-card";
import { MonthlyPayrollTrendCard } from "./monthly-payroll-trend-card";

type WorkforceChartsSectionProps = {
  monthlyPayrollData: MonthlyPayrollPoint[];
  budgetUtilizationData: DepartmentBudgetPoint[];
};

export function WorkforceChartsSection({ monthlyPayrollData, budgetUtilizationData }: WorkforceChartsSectionProps) {
  return (
    <section className="grid gap-3 md:grid-cols-2">
      <MonthlyPayrollTrendCard data={monthlyPayrollData} />
      <DepartmentBudgetUtilizationCard data={budgetUtilizationData} />
    </section>
  );
}
