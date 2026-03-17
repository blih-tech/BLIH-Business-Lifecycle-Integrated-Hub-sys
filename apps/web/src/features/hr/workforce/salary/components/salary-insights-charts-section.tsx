import type {
  DepartmentSalaryPoint,
  DepartmentSalarySummary,
  SalaryPerformancePoint,
} from "@/features/hr/workforce/salary/types";

import { SalaryByDepartmentCard } from "./salary-by-department-card";
import { SalaryPerformanceCorrelationCard } from "./salary-performance-correlation-card";

type SalaryInsightsChartsSectionProps = {
  performanceData: SalaryPerformancePoint[];
  departmentData: DepartmentSalaryPoint[];
  departmentSummaries: DepartmentSalarySummary[];
};

export function SalaryInsightsChartsSection({
  performanceData,
  departmentData,
  departmentSummaries,
}: SalaryInsightsChartsSectionProps) {
  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <SalaryPerformanceCorrelationCard data={performanceData} />
      <SalaryByDepartmentCard data={departmentData} summaries={departmentSummaries} />
    </section>
  );
}
