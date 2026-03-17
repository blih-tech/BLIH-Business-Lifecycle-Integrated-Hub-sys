import {
  employeePayrollItems,
  monthlyPaymentSummaries,
  payrollScheduleItems,
} from "@/features/hr/workforce/payroll/mock-data";
import {
  EmployeePayrollDetailsSection,
  MonthlyPaymentSummarySection,
  PayrollFiltersBar,
  UpcomingPayrollScheduleSection,
} from "@/features/hr/workforce/payroll/components";

export * from "@/features/hr/workforce/payroll/components";
export * from "@/features/hr/workforce/payroll/types";

export function WorkforcePayrollContent() {
  return (
    <main className="mx-auto w-full max-w-[1038px] space-y-3 px-4 py-4 md:px-5 md:py-5">
      <UpcomingPayrollScheduleSection items={payrollScheduleItems} />
      <PayrollFiltersBar />
      <EmployeePayrollDetailsSection items={employeePayrollItems} />
      <MonthlyPaymentSummarySection items={monthlyPaymentSummaries} />
    </main>
  );
}
