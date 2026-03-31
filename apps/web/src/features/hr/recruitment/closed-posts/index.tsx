"use client";

import { ActiveJobCard } from "@/features/hr/recruitment/active-posting/components/active-job-card";
import { activePostingJobs } from "@/features/hr/recruitment/active-posting/mock-data";

export function RecruitmentClosedPostsContent() {
  return (
    <main className="mx-auto w-full max-w-[1024px] space-y-6 px-4 py-5 md:px-5 md:py-6">
      <section className="space-y-4">
        {activePostingJobs.map((job, index) => (
          <ActiveJobCard key={job.id} job={job} defaultExpanded={index === 0} historyMode />
        ))}
      </section>
    </main>
  );
}
