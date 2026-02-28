import { CalendarDays, CheckSquare } from "lucide-react";

import { checklistSummaryStats, checklistTemplates } from "@/features/hr/onboarding/checklists/mock-data";
import { ChecklistCard } from "@/features/hr/onboarding/checklists/components";
import { ProgressStatCard } from "@/features/hr/onboarding/progress/components";

const ICONS = {
  "check-square": <CheckSquare className="h-4 w-4" />,
  calendar: <CalendarDays className="h-4 w-4" />,
} as const;

export function OnboardingChecklistsContent() {
  return (
    <main className="mx-auto w-full max-w-[1024px] space-y-5 px-4 py-4 md:px-5 md:py-5">
      <section className="grid gap-4 md:grid-cols-3">
        {checklistSummaryStats.map((stat) => (
          <ProgressStatCard key={stat.id} stat={stat} icon={ICONS[stat.icon]} />
        ))}
      </section>

      <section>
        <h2 className="text-xl font-semibold tracking-[-0.3125px] text-black">Onboarding Checklists</h2>
        <p className="mt-1 text-sm tracking-[-0.1504px] text-[#666]">Create and manage reusable onboarding checklists</p>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {checklistTemplates.map((checklist) => (
            <ChecklistCard key={checklist.id} checklist={checklist} />
          ))}
        </div>
      </section>
    </main>
  );
}
