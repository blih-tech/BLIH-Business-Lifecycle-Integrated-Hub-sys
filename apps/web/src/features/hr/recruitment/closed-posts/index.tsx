"use client";

import { useMemo, useState } from "react";

import { ActiveJobCard } from "@/features/hr/recruitment/active-posting/components/active-job-card";
import { activePostingJobs } from "@/features/hr/recruitment/active-posting/mock-data";
import { AnalyticsForJobs, FrequentlyPostedJobsCard, JobPostAnalyticsCard } from "@/features/hr/recruitment/closed-posts/components";

export function RecruitmentClosedPostsContent() {
  const [selectedJobId, setSelectedJobId] = useState(activePostingJobs[0]?.id ?? "");

  const selectedJob = useMemo(
    () => activePostingJobs.find((job) => job.id === selectedJobId) ?? activePostingJobs[0],
    [selectedJobId],
  );

  if (!selectedJob) return null;

  return (
    <main className="mx-auto w-full max-w-[1024px] space-y-6 px-4 py-5 md:px-5 md:py-6">
      <section className="grid gap-4 lg:grid-cols-[2.35fr_1fr]">
        <FrequentlyPostedJobsCard />
        <AnalyticsForJobs jobs={activePostingJobs} selectedJobId={selectedJobId} onSelectJob={setSelectedJobId} />
      </section>

      <section>
        <JobPostAnalyticsCard job={selectedJob} />
      </section>

      <section className="space-y-4 pt-4">
        {activePostingJobs.map((job) => (
          <ActiveJobCard key={job.id} job={job} defaultExpanded={false} />
        ))}
      </section>
    </main>
  );
}
