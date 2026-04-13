'use client';

import { useMemo } from 'react';
import { ActiveJobCard } from '@/features/hr/recruitment/active-posting/components/active-job-card';
import {
  useApplicants,
  useInterviews,
  useJobs,
  useOffers,
} from '@/features/hr/recruitment/requests/hooks';
import { mapJobsToActivePosting } from '@/features/hr/recruitment/shared/mappers';

export function RecruitmentClosedPostsContent() {
  const { data: jobs = [] } = useJobs({ status: 'CLOSED' });
  const { data: applicants = [] } = useApplicants();
  const { data: interviews = [] } = useInterviews();
  const { data: offers = [] } = useOffers();

  const activePostingJobs = useMemo(
    () => mapJobsToActivePosting(jobs, applicants, interviews, offers, {}),
    [applicants, interviews, jobs, offers],
  );

  return (
    <main className="mx-auto w-full max-w-[1024px] space-y-6 px-4 py-5 md:px-5 md:py-6">
      <section className="space-y-4">
        {activePostingJobs.map((job, index) => (
          <ActiveJobCard
            key={job.id}
            job={job}
            defaultExpanded={index === 0}
            historyMode
          />
        ))}
      </section>
    </main>
  );
}
