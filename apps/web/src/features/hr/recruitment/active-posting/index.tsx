import { activePostingJobs } from '@/features/hr/recruitment/active-posting/mock-data';
import { ActiveJobCard } from '@/features/hr/recruitment/active-posting/components/active-job-card';

export function RecruitmentActivePostingContent() {
  return (
    <main className="mx-auto w-full max-w-[960px] space-y-4 px-4 py-5 md:px-5 md:py-6">
      <section className="space-y-1">
        <h1 className="ui-section-title text-foreground">Active Posting</h1>
        <p className="ui-body text-muted-foreground">
          Manage published jobs and monitor role activity.
        </p>
      </section>

      <section className="space-y-3">
        {activePostingJobs.map((job, index) => (
          <ActiveJobCard key={job.id} job={job} defaultExpanded={index === 0} />
        ))}
      </section>
    </main>
  );
}
