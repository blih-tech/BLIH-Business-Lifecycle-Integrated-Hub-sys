import { Award, CalendarDays, TrendingUp } from "lucide-react";

import { probationSummaryStats, probationEmployees } from "@/features/hr/onboarding/probation/mock-data";
import { ProbationCard } from "@/features/hr/onboarding/probation/components";
import { ProgressStatCard } from "@/features/hr/onboarding/progress/components";

const ICONS = {
  calendar: <CalendarDays className="h-4 w-4" />,
  trend: <TrendingUp className="h-4 w-4" />,
  award: <Award className="h-4 w-4" />,
} as const;

export function OnboardingProbationContent() {
  return (
    <main className="mx-auto w-full max-w-[1024px] space-y-5 px-4 py-4 md:px-5 md:py-5">
      <section className="grid gap-4 md:grid-cols-3">
        {probationSummaryStats.map((stat) => (
          <ProgressStatCard key={stat.id} stat={stat} icon={ICONS[stat.icon]} />
        ))}
      </section>

      <section>
        <h2 className="text-xl font-semibold tracking-[-0.3125px] text-black">Performance and Probation</h2>
        <p className="mt-1 text-sm tracking-[-0.1504px] text-[#666]">KPI tracking, reviews, and results of employees on probation.</p>

        <div className="mt-4 space-y-3">
          {probationEmployees.map((employee, index) => (
            <ProbationCard key={employee.id} employee={employee} defaultExpanded={index === 0} />
          ))}
        </div>
      </section>
    </main>
  );
}
