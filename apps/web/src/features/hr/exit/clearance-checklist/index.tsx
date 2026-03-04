import {
  clearanceQuickActions,
  clearanceTemplateTasks,
  employeeClearanceProgressItems,
  exitClearanceChecklistStats,
} from "@/features/hr/exit/clearance-checklist/mock-data";
import {
  ClearanceChecklistStatsGrid,
  ClearanceQuickActionsSection,
  ClearanceTemplateSection,
  EmployeeClearanceProgressSection,
} from "@/features/hr/exit/clearance-checklist/components";

export * from "@/features/hr/exit/clearance-checklist/components";
export * from "@/features/hr/exit/clearance-checklist/types";

export function ExitClearanceChecklistContent() {
  return (
    <main className="mx-auto w-full max-w-[1024px] space-y-4 px-4 py-4 md:px-5 md:py-5">
      <ClearanceChecklistStatsGrid items={exitClearanceChecklistStats} />
      <ClearanceTemplateSection items={clearanceTemplateTasks} />
      <EmployeeClearanceProgressSection items={employeeClearanceProgressItems} />
      <ClearanceQuickActionsSection items={clearanceQuickActions} />
    </main>
  );
}
