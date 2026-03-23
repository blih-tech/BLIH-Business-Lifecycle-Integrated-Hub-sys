import { RecruitmentCard } from '@/features/hr/recruitment/ongoing-recruitment/components/recruitment-card';
import { ongoingRecruitmentJobs } from '@/features/hr/recruitment/ongoing-recruitment/mock-data';

export * from '@/features/hr/recruitment/ongoing-recruitment/components';
export * from '@/features/hr/recruitment/ongoing-recruitment/types';

type OngoingRecruitmentContentProps = {
  currentUserName: string;
};

export function OngoingRecruitmentContent({
  currentUserName,
}: OngoingRecruitmentContentProps) {
  return (
    <main className="mx-auto w-full max-w-[960px] space-y-4 px-4 py-5 md:px-5 md:py-6">
      <section className="space-y-1">
        <h1 className="ui-section-title text-foreground">
          Interviews and Schedules
        </h1>
        <p className="ui-body text-muted-foreground">
          Track candidates through the hiring pipeline.
        </p>
      </section>

      <section className="space-y-4">
        {ongoingRecruitmentJobs.map((job, index) => (
          <RecruitmentCard
            key={job.id}
            job={job}
            currentUserName={currentUserName}
            defaultExpanded={index === 0}
          />
        ))}
      </section>
    </main>
  );
}
