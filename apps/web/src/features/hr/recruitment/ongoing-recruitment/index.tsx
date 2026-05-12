import { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { RecruitmentCard } from '@/features/hr/recruitment/ongoing-recruitment/components/recruitment-card';
import type {
  OngoingInterviewApplicant,
  OngoingRecruitmentJob,
} from '@/features/hr/recruitment/ongoing-recruitment/types';
import {
  useApplicants,
  useInterviews,
} from '@/features/hr/recruitment/hooks/use-recruitment-pipeline';
import { useUpdateApplicantStatusMutation } from '@/features/hr/recruitment/hooks/use-recruitment-pipeline';
import { useJobs } from '@/features/hr/recruitment/requests/hooks/use-jobs';
import type { InterviewResponseDto } from '@repo/types/recruitment/interviews';
import type { UpdateApplicantStatusDto } from '@repo/types/recruitment/applicants';
import { queryKeys } from '@/lib/query-keys';

export * from '@/features/hr/recruitment/ongoing-recruitment/components';
export * from '@/features/hr/recruitment/ongoing-recruitment/types';

type OngoingRecruitmentContentProps = {
  currentUserName: string;
};

function interviewToOngoingCandidate(
  interview: InterviewResponseDto,
): OngoingInterviewApplicant[] {
  return interview.participants.map((participant) => ({
    id: participant.applicantId,
    fullName: participant.applicant
      ? `${participant.applicant.firstName} ${participant.applicant.lastName}`.trim()
      : 'Unknown Applicant',
    phone: 'N/A',
    interviewStatus:
      interview.status === 'SCHEDULED' ? 'scheduled' : 'interviewed',
    status: interview.status === 'SCHEDULED' ? 'pending' : 'waitlisted',
    interviewDate: interview.scheduledAt,
    interviewTime: interview.scheduledAt,
    rating: 0,
    committeeReviews: [],
  }));
}

export function OngoingRecruitmentContent({
  currentUserName,
}: OngoingRecruitmentContentProps) {
  const queryClient = useQueryClient();
  const { data: jobs = [] } = useJobs({ status: 'PUBLISHED' });
  const { data: applicants = [] } = useApplicants();
  const { data: interviews = [] } = useInterviews();
  const updateApplicantStatus = useUpdateApplicantStatusMutation();

  const ongoingRecruitmentJobs = useMemo<OngoingRecruitmentJob[]>(() => {
    return jobs.map((job) => {
      const jobApplicants = applicants.filter(
        (applicant) => applicant.jobId === job.job.id,
      );
      const jobInterviews = interviews.filter(
        (interview) => interview.jobId === job.job.id,
      );
      const interviewCandidates = jobInterviews.flatMap(
        interviewToOngoingCandidate,
      );

      const shortlist = jobApplicants
        .filter((applicant) => applicant.status === 'SHORTLISTED')
        .map((candidate) => ({
          id: candidate.id,
          fullName: `${candidate.firstName} ${candidate.lastName}`.trim(),
          phone: candidate.phone ?? 'N/A',
          listedAt: candidate.shortlistedAt ?? candidate.appliedAt,
          rating: candidate.profileScore ?? 0,
          answers: [],
          aiAnalysis: {
            score: candidate.profileScore ?? 0,
            summary: candidate.coverLetter ?? 'No AI summary.',
            strengths: [],
            concerns: [],
            recommendation: 'Review manually.',
          },
        }));
      const waitlisted = jobApplicants
        .filter((applicant) => applicant.status === 'WAITLIST')
        .map((candidate) => ({
          id: candidate.id,
          fullName: `${candidate.firstName} ${candidate.lastName}`.trim(),
          phone: candidate.phone ?? 'N/A',
          listedAt: candidate.waitlistAt ?? candidate.appliedAt,
          rating: candidate.profileScore ?? 0,
          answers: [],
          aiAnalysis: {
            score: candidate.profileScore ?? 0,
            summary: candidate.coverLetter ?? 'No AI summary.',
            strengths: [],
            concerns: [],
            recommendation: 'Review manually.',
          },
        }));

      return {
        id: job.job.id,
        title: job.job.title,
        statusLabel: 'Active Job',
        department: job.requestForm?.department ?? job.job.departmentId,
        interviewedCount: interviewCandidates.filter(
          (candidate) => candidate.interviewStatus === 'interviewed',
        ).length,
        onInterviewCount: interviewCandidates.filter(
          (candidate) => candidate.interviewStatus === 'scheduled',
        ).length,
        shortlistedCount: shortlist.length,
        waitlistedCount: waitlisted.length,
        topMatch: {
          fullName: shortlist[0]?.fullName ?? waitlisted[0]?.fullName ?? 'N/A',
          phone: shortlist[0]?.phone ?? waitlisted[0]?.phone ?? 'N/A',
          experience: 'N/A',
          salaryExpectation: 'N/A',
          canStart: 'N/A',
          matchScore: shortlist[0]?.rating ?? waitlisted[0]?.rating ?? 0,
        },
        interviewCommittee: [],
        interviews: interviewCandidates,
        shortlisted: shortlist,
        waitlisted,
      };
    });
  }, [applicants, interviews, jobs]);

  async function handleInterviewDecision(payload: {
    applicantId: string;
    action: 'reject' | 'offer' | 'waitlist';
    reviews: OngoingInterviewApplicant['committeeReviews'];
  }): Promise<void> {
    const status: UpdateApplicantStatusDto['status'] =
      payload.action === 'reject'
        ? 'REJECTED'
        : payload.action === 'offer'
          ? 'OFFER'
          : 'WAITLIST';
    try {
      await updateApplicantStatus.mutateAsync({
        applicantId: payload.applicantId,
        payload: {
          status,
          notes: `Updated from ongoing recruitment review (${payload.action})`,
        },
      });
      toast.success('Candidate status updated.');
      await queryClient.invalidateQueries({
        queryKey: [...queryKeys.hr.recruitment(), 'applicants'],
      });
    } catch (error) {
      console.error('Failed to update candidate status', error);
      toast.error('Failed to update candidate status.');
    }
  }

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
            onInterviewDecision={handleInterviewDecision}
          />
        ))}
      </section>
    </main>
  );
}
