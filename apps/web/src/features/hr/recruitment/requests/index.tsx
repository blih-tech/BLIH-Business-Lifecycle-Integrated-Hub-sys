import {
  emptyRequestsMessage,
  jobRequests,
  requestStats,
} from "@/features/hr/recruitment/requests/mock-data";
import {
  EmptyRequestsState,
  RequestsSection,
  RequestsStatsCard,
} from "@/features/hr/recruitment/requests/components";

export * from "@/features/hr/recruitment/requests/components";
export * from "@/features/hr/recruitment/requests/types";
export * from "@/features/hr/recruitment/requests/hooks";

type RecruitmentRequestsContentProps = {
  currentUserName: string;
};

export function RecruitmentRequestsContent({ currentUserName }: RecruitmentRequestsContentProps) {
  const pendingRequests = jobRequests.filter((request) => request.status === "active");
  const approvedByYouRequests = jobRequests.filter((request) => request.status === "by_me");
  const declinedRequests = jobRequests.filter((request) => request.status === "closed");

  return (
    <main className="mx-auto w-full max-w-[960px] space-y-8 px-4 py-5 md:px-5 md:py-6">
      <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {requestStats.map((item) => (
          <RequestsStatsCard key={item.id} item={item} />
        ))}
      </section>

      <RequestsSection
        title="Pending Approval Requests"
        subtitle="Review and publish job postings"
        items={pendingRequests}
        currentUserName={currentUserName}
      />

      <RequestsSection
        title="Approved by You"
        subtitle="Waiting for other approvals"
        items={approvedByYouRequests}
        currentUserName={currentUserName}
      />

      <RequestsSection
        title="Declined Job Postings"
        subtitle="Completed recruitment processes and hires"
        items={declinedRequests}
        currentUserName={currentUserName}
        includeFilter
      />

      {jobRequests.length === 0 ? (
        <EmptyRequestsState message={emptyRequestsMessage} />
      ) : null}
    </main>
  );
}
