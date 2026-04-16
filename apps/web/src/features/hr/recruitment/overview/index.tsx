import { useMemo } from 'react';
import {
  JobApplicationFrequencyPanel,
  RecruitmentOverviewAnalytics,
  StatsGrid,
} from '@/features/hr/recruitment/overview/components';
import {
  useApplicants,
  useInterviews,
  useJobs,
  useOffers,
} from '@/features/hr/recruitment/requests/hooks';
import {
  mapJobsToActivePosting,
  mapToOverviewStats,
} from '@/features/hr/recruitment/shared/mappers';

export * from '@/features/hr/recruitment/overview/components';
export * from '@/features/hr/recruitment/overview/types';

export function RecruitmentOverviewContent() {
  const { data: jobs = [] } = useJobs();
  const { data: applicants = [] } = useApplicants();
  const { data: interviews = [] } = useInterviews();
  const { data: offers = [] } = useOffers();

  const activePostingJobs = useMemo(
    () => mapJobsToActivePosting(jobs, applicants, interviews, offers, {}),
    [applicants, interviews, jobs, offers],
  );

  const recruitmentStats = useMemo(
    () => mapToOverviewStats(jobs, applicants),
    [applicants, jobs],
  );

  const monthlyFrequencyData = useMemo(
    () =>
      jobs.map((job) => ({
        month: new Date(job.job.createdAt).toLocaleString(undefined, {
          month: 'short',
        }),
        count: job.job.applicationsCount ?? 0,
      })),
    [jobs],
  );

  const dailyAreaData = useMemo(
    () =>
      jobs.slice(0, 7).map((job) => {
        const total = job.job.applicationsCount ?? 0;
        return {
          day: new Date(job.job.createdAt).toLocaleDateString(),
          upper: total * 30,
          lower: total * 12,
        };
      }),
    [jobs],
  );

  return (
    <main className="mx-auto w-full max-w-[1024px] space-y-6 px-4 py-4 md:px-5 md:py-5">
      <StatsGrid items={recruitmentStats} />
      <JobApplicationFrequencyPanel
        monthlyData={monthlyFrequencyData}
        dailyData={dailyAreaData}
      />
      <RecruitmentOverviewAnalytics jobs={activePostingJobs} />
    </main>
  );
}
