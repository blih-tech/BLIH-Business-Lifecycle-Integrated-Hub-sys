import { mapJobResponseToRequest } from '@/features/hr/recruitment/requests/job-request-mappers';
import type {
  ActiveJobItem,
  JobApplicant,
} from '@/features/hr/recruitment/active-posting/types';
import type { OngoingRecruitmentJob } from '@/features/hr/recruitment/ongoing-recruitment/types';
import type { RecruitmentStatItem } from '@/features/hr/recruitment/overview/types';
import type {
  ApplicantResponseDto,
  InterviewResponseDto,
  JobResponseDto,
  OfferResponseDto,
} from '@/types';

function formatDate(input?: string | null): string {
  if (!input) return '-';
  return new Date(input).toLocaleDateString();
}

function fullName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim() || 'Unknown';
}

function byJob<T extends { jobId: string }>(rows: T[]): Record<string, T[]> {
  return rows.reduce<Record<string, T[]>>((acc, row) => {
    (acc[row.jobId] ||= []).push(row);
    return acc;
  }, {});
}

export function mapJobsToRequests(
  jobs: JobResponseDto[],
  currentUserName: string,
) {
  return jobs.map((job) => {
    const workflow = job.requestForm?.status?.workflow;
    const requestedBy = job.requestForm?.requestedBy ?? '';
    const isByMe =
      requestedBy.trim().toLowerCase() === currentUserName.trim().toLowerCase();
    if (workflow === 'REJECTED') return mapJobResponseToRequest(job, 'closed');
    if (workflow === 'PENDING_FOR_APPROVAL') {
      return mapJobResponseToRequest(job, isByMe ? 'by_me' : 'active');
    }
    return mapJobResponseToRequest(job, 'posted');
  });
}

function mapApplicantToCardApplicant(
  applicant: ApplicantResponseDto,
  aiScores: Record<string, number>,
): JobApplicant {
  const aiScore = aiScores[applicant.id] ?? applicant.profileScore ?? 0;
  const summary = `Candidate is currently in ${applicant.status} stage.`;
  return {
    id: applicant.id,
    fullName: fullName(applicant.firstName, applicant.lastName),
    phone: applicant.phone ?? '-',
    appliedAt: formatDate(applicant.appliedAt),
    yearsOfExperience: applicant.yearsExperience
      ? `${applicant.yearsExperience} years`
      : '-',
    salaryExpectation: applicant.expectedSalary ?? '-',
    aiScore,
    answers: [
      {
        id: `${applicant.id}-name`,
        label: 'Full Name',
        value: fullName(applicant.firstName, applicant.lastName),
        type: 'text',
      },
      {
        id: `${applicant.id}-email`,
        label: 'Email',
        value: applicant.email,
        type: 'text',
      },
      {
        id: `${applicant.id}-phone`,
        label: 'Phone Number',
        value: applicant.phone ?? '-',
        type: 'text',
      },
      {
        id: `${applicant.id}-resume`,
        label: 'Resume / CV',
        value: applicant.resumeUrl ?? '-',
        type: 'file',
      },
      {
        id: `${applicant.id}-linkedin`,
        label: 'LinkedIn Profile',
        value: applicant.linkedinUrl ?? '-',
        type: 'link',
      },
    ],
    aiAnalysis: {
      score: aiScore,
      summary,
      strengths: ['Strong profile completeness'],
      concerns: ['Needs recruiter validation'],
      recommendation:
        aiScore >= 80 ? 'Advance to interview' : 'Review manually',
    },
  };
}

export function mapJobsToActivePosting(
  jobs: JobResponseDto[],
  applicants: ApplicantResponseDto[],
  interviews: InterviewResponseDto[],
  offers: OfferResponseDto[],
  aiScoresByApplicant: Record<string, number>,
): ActiveJobItem[] {
  const applicantsMap = byJob(applicants);
  const interviewsMap = byJob(interviews);
  const offersMap = byJob(offers);

  return jobs.map((job) => {
    const jobApplicants = applicantsMap[job.job.id] ?? [];
    const applicantCards = jobApplicants.map((item) =>
      mapApplicantToCardApplicant(item, aiScoresByApplicant),
    );
    const sorted = [...applicantCards].sort((a, b) => b.aiScore - a.aiScore);
    const top = sorted[0];
    const interviewCount = (interviewsMap[job.job.id] ?? []).length;
    const offerCount = (offersMap[job.job.id] ?? []).length;

    return {
      id: job.job.id,
      title: job.job.title,
      levelTag: job.job.experienceLevel ?? undefined,
      statusLabel: 'Active Job',
      department: job.requestForm?.department ?? job.job.departmentId,
      employmentType: job.job.employmentType ?? '-',
      workMode: job.job.workLocationType,
      openings: job.job.openings ?? 1,
      applicantsCount: jobApplicants.length,
      viewsCount: job.job.viewsCount ?? 0,
      postedAt: formatDate(job.job.publishedAt ?? job.job.createdAt),
      closesAt: formatDate(job.job.applicationDeadline),
      priority: 'medium',
      summary: 'Live recruitment posting data.',
      keyResponsibilities: job.job.responsibilities ?? [],
      requirements: job.job.requiredSkills ?? [],
      benefits: job.job.benefits ?? [],
      importanceOfHire: [job.requestForm?.businessJustification ?? ''],
      requestedBy: {
        name: job.requestForm?.requestedBy ?? 'Unknown',
        role: '-',
        department: job.requestForm?.department ?? job.job.departmentId,
      },
      hiringCommittee: [],
      revisionsFrom: [],
      approvedBy: [],
      applicants: applicantCards,
      analytics: [
        { label: 'Views', value: job.job.viewsCount ?? 0 },
        { label: 'Applications', value: jobApplicants.length },
        { label: 'Interviews', value: interviewCount },
        { label: 'Offers', value: offerCount },
      ],
      topMatch: {
        fullName: top?.fullName ?? '-',
        phone: top?.phone ?? '-',
        experience: top?.yearsOfExperience ?? '-',
        salaryExpectation: top?.salaryExpectation ?? '-',
        canStart: '-',
        matchScore: top?.aiScore ?? 0,
      },
      pipelineStats: {
        total: jobApplicants.length,
        interviewed: interviewCount,
        shortlist: jobApplicants.filter((a) => a.status === 'SHORTLISTED')
          .length,
        rejected: jobApplicants.filter((a) => a.status === 'REJECTED').length,
      },
      applicationFrequency: [],
      salaryDistribution: [],
      genderDistribution: [],
      experienceDistribution: [],
    };
  });
}

export function mapActiveToOngoing(
  active: ActiveJobItem[],
): OngoingRecruitmentJob[] {
  return active.map((job) => ({
    id: job.id,
    title: job.title,
    statusLabel: job.statusLabel,
    department: job.department,
    interviewedCount: job.pipelineStats.interviewed,
    onInterviewCount: job.pipelineStats.interviewed,
    shortlistedCount: job.pipelineStats.shortlist,
    waitlistedCount: job.applicants.filter(
      (a) => a.aiScore >= 70 && a.aiScore < 80,
    ).length,
    topMatch: job.topMatch,
    interviewCommittee: [],
    interviews: [],
    shortlisted: job.applicants
      .filter((a) => a.aiScore >= 80)
      .map((a) => ({
        id: a.id,
        fullName: a.fullName,
        phone: a.phone,
        listedAt: a.appliedAt,
        rating: a.aiScore,
        answers: a.answers,
        aiAnalysis: a.aiAnalysis,
      })),
    waitlisted: job.applicants
      .filter((a) => a.aiScore >= 60 && a.aiScore < 80)
      .map((a) => ({
        id: a.id,
        fullName: a.fullName,
        phone: a.phone,
        listedAt: a.appliedAt,
        rating: a.aiScore,
        answers: a.answers,
        aiAnalysis: a.aiAnalysis,
      })),
  }));
}

export function mapToOverviewStats(
  jobs: JobResponseDto[],
  applicants: ApplicantResponseDto[],
): RecruitmentStatItem[] {
  const pendingRequests = jobs.filter(
    (j) => j.requestForm?.status.workflow === 'PENDING_FOR_APPROVAL',
  ).length;
  const activeRecruitments = jobs.filter(
    (j) => j.requestForm?.status.workflow === 'PUBLISHED',
  ).length;
  const totalEmployees = applicants.filter((a) => a.status === 'HIRED').length;

  return [
    {
      id: 'pending-requests',
      label: 'Pending Requests',
      value: String(pendingRequests),
      icon: 'clock-3',
    },
    {
      id: 'active-recruitments',
      label: 'Active Recruitments',
      value: String(activeRecruitments),
      icon: 'circle-check-big',
    },
    {
      id: 'total-employees',
      label: 'Total Employees',
      value: String(totalEmployees),
      icon: 'user-round-plus',
    },
  ];
}
