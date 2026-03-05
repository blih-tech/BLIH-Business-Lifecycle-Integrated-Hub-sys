import {
  emptyRequestsMessage,
  jobRequests,
  requestStats,
} from "@/features/hr/recruitment/requests/mock-data";
import {
  EmptyRequestsState,
  JobRequestsSection,
  RequestsStatsCard,
} from "@/features/hr/recruitment/requests/components";

export * from "@/features/hr/recruitment/requests/components";
export * from "@/features/hr/recruitment/requests/types";

export function RecruitmentRequestsContent() {
  return (
    <main className="mx-auto w-full max-w-[960px] space-y-4 px-4 py-5 md:px-5 md:py-6">
      <section className="space-y-1">
        <h1 className="ui-section-title text-foreground">Pending Approval Requests</h1>
        <p className="ui-body text-muted-foreground">Review and publish job postings</p>
      </section>

      <JobRequestsSection items={jobRequests} />

      <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {requestStats.map((item) => (
          <RequestsStatsCard key={item.id} item={item} />
        ))}
      </section>

      {jobRequests.length === 0 ? (
        <EmptyRequestsState message={emptyRequestsMessage} />
      ) : null}
    </main>
  );
}
