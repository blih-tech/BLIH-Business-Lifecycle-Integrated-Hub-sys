import {
  ChecklistStatCard,
  JobApplicationFrequencyCard,
  SummaryStatCard,
  WorkHoursStatCard,
} from '@/features/hr/onboarding/overview/components';
import {
  peopleChecklistStats,
  peopleJobApplicationFrequency,
  peopleSummaryStats,
  peopleWorkHoursStats,
} from '@/features/hr/people/overview/mock-data';

export function PeopleOverviewContent() {
  return (
    <main className="mx-auto w-full max-w-[1024px] space-y-5 px-4 py-4 md:px-5 md:py-5">
      <section className="grid gap-4 md:grid-cols-3">
        {peopleSummaryStats.map((stat) => (
          <SummaryStatCard key={stat.id} stat={stat} />
        ))}
      </section>

      <section className="rounded-[12px] border border-[#e5e5e5] bg-white p-4">
        <p className="text-sm text-black">Work Hours Performance</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {peopleWorkHoursStats.map((stat) => (
            <WorkHoursStatCard key={stat.id} stat={stat} />
          ))}
        </div>
      </section>

      <JobApplicationFrequencyCard data={peopleJobApplicationFrequency} />

      <section className="grid gap-4 md:grid-cols-3">
        {peopleChecklistStats.map((stat) => (
          <ChecklistStatCard key={stat.id} stat={stat} />
        ))}
      </section>
    </main>
  );
}
