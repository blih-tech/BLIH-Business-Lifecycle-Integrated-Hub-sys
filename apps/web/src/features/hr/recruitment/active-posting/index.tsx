'use client';

import { useEffect, useMemo, useState } from 'react';
import { ActiveJobCard } from '@/features/hr/recruitment/active-posting/components/active-job-card';
import {
  useApplicants,
  useInterviews,
  useJobs,
  useOffers,
} from '@/features/hr/recruitment/requests/hooks';
import { mapJobsToActivePosting } from '@/features/hr/recruitment/shared/mappers';
import { screenCandidates } from '@/features/hr/recruitment/shared/api';

export function RecruitmentActivePostingContent() {
  const { data: jobs = [] } = useJobs({ status: 'PUBLISHED' });
  const { data: applicants = [] } = useApplicants();
  const { data: interviews = [] } = useInterviews();
  const { data: offers = [] } = useOffers();
  const [aiScores, setAiScores] = useState<Record<string, number>>({});

  useEffect(() => {
    async function loadAiScores() {
      const result = await Promise.all(
        jobs.map((job) => screenCandidates(job.job.id)),
      );
      setAiScores(Object.assign({}, ...result));
    }
    if (jobs.length > 0) {
      void loadAiScores();
    }
  }, [jobs]);

  const activePostingJobs = useMemo(
    () =>
      mapJobsToActivePosting(jobs, applicants, interviews, offers, aiScores),
    [aiScores, applicants, interviews, jobs, offers],
  );

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
