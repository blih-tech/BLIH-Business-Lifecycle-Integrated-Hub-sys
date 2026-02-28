import { onboardingMembers, progressSummaryStats } from "@/features/hr/onboarding/progress/mock-data";
import { OnboardingCard, ProgressStatCard } from "@/features/hr/onboarding/progress/components";

export function OnboardingProgressContent() {
  return (
    <main className="mx-auto w-full max-w-[1024px] space-y-6 px-4 py-5 md:px-5 md:py-6">
      <section className="grid gap-4 md:grid-cols-3">
        {progressSummaryStats.map((stat) => (
          <ProgressStatCard key={stat.id} stat={stat} />
        ))}
      </section>

      <section className="space-y-4 rounded-[12px] border border-[#e5e7eb] bg-white p-4 md:p-5">
        <div>
          <h2 className="text-base font-semibold tracking-[-0.2px] text-[#111827]">Active Onboarding Processes</h2>
          <p className="mt-1 text-sm text-[#667085]">Checklists and tracking new employees</p>
        </div>

        <div className="space-y-3">
          {onboardingMembers.map((member) => (
            <OnboardingCard key={member.id} member={member} />
          ))}
        </div>
      </section>

      <section className="rounded-[12px] border border-[#eaecf0] bg-[#f9fafb] px-4 py-5 text-center">
        <p className="text-sm text-[#667085]">No active onboarding to track.</p>
      </section>
    </main>
  );
}
