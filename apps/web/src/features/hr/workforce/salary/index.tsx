import {
  departmentSalaryData,
  departmentSalarySummaries,
  employeeSalaryItems,
  salaryAdjustmentRequests,
  salaryAuditLogItems,
  salaryPerformanceData,
  salaryStats,
} from '@/features/hr/workforce/salary/mock-data';
import {
  EmployeeSalarySection,
  SalaryAdjustmentRequestsSection,
  SalaryAuditLogSection,
  SalaryInsightsChartsSection,
  SalaryStatsGrid,
} from '@/features/hr/workforce/salary/components';

export * from '@/features/hr/workforce/salary/components';
export * from '@/features/hr/workforce/salary/types';

export function WorkforceSalaryContent() {
  return (
    <main className="mx-auto w-full max-w-[1038px] space-y-4 px-4 py-4 md:px-5 md:py-5">
      <SalaryStatsGrid items={salaryStats} />
      <SalaryAdjustmentRequestsSection items={salaryAdjustmentRequests} />
      <SalaryInsightsChartsSection
        performanceData={salaryPerformanceData}
        departmentData={departmentSalaryData}
        departmentSummaries={departmentSalarySummaries}
      />
      <EmployeeSalarySection items={employeeSalaryItems} />
      <SalaryAuditLogSection items={salaryAuditLogItems} />
    </main>
  );
}
