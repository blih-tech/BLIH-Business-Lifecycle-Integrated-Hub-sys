import {
  emptyReadyToPostMessage,
  readyToPostJobs,
} from "@/features/hr/recruitment/ready-to-post/mock-data";
import {
  ReadyToPostJobsSection,
  ReadyToPostEmptyState,
} from "@/features/hr/recruitment/ready-to-post/components";

export * from "@/features/hr/recruitment/ready-to-post/components";
export * from "@/features/hr/recruitment/ready-to-post/types";

export function RecruitmentReadyToPostContent() {
  return (
    <main className="mx-auto w-full max-w-[960px] space-y-4 px-4 py-5 md:px-5 md:py-6">
      <section className="space-y-1">
        <h1 className="ui-section-title text-foreground">Jobs Ready to Post</h1>
        <p className="ui-body text-muted-foreground">Review and publish job postings</p>
      </section>

      <ReadyToPostJobsSection items={readyToPostJobs} />

      {readyToPostJobs.length === 0 ? (
        <ReadyToPostEmptyState message={emptyReadyToPostMessage} />
      ) : null}
    </main>
  );
}
