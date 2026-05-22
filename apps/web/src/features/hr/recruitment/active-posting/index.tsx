'use client';

import { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { ActiveJobCard } from '@/features/hr/recruitment/active-posting/components/active-job-card';
import type {
  ActiveJobItem,
  JobApplicant,
} from '@/features/hr/recruitment/active-posting/types';
import { useApplicants } from '@/features/hr/recruitment/hooks/use-recruitment-pipeline';
import {
  useCloseJobMutation,
  useJobs,
} from '@/features/hr/recruitment/requests/hooks/use-jobs';
import { queryKeys } from '@/lib/query-keys';

function mapApplicant(applicant: {
  id: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  appliedAt: string;
  yearsExperience: number | null;
  expectedSalary: string | null;
  profileScore: number | null;
  email: string;
  location: string | null;
  resumeUrl: string | null;
  linkedinUrl: string | null;
  portfolioUrl: string | null;
  coverLetter: string | null;
}): JobApplicant {
  const fullName = `${applicant.firstName} ${applicant.lastName}`.trim();
  return {
    id: applicant.id,
    fullName,
    phone: applicant.phone ?? 'N/A',
    appliedAt: applicant.appliedAt,
    yearsOfExperience:
      applicant.yearsExperience === null
        ? 'N/A'
        : `${applicant.yearsExperience} years`,
    salaryExpectation: applicant.expectedSalary ?? 'N/A',
    aiScore: applicant.profileScore ?? 0,
    answers: [
      {
        id: `${applicant.id}-name`,
        label: 'Full Name',
        value: fullName,
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
        label: 'Phone',
        value: applicant.phone ?? 'N/A',
        type: 'text',
      },
      {
        id: `${applicant.id}-location`,
        label: 'Location',
        value: applicant.location ?? 'N/A',
        type: 'text',
      },
      {
        id: `${applicant.id}-salary`,
        label: 'Salary Expectation',
        value: applicant.expectedSalary ?? 'N/A',
        type: 'number',
      },
      {
        id: `${applicant.id}-linkedin`,
        label: 'LinkedIn',
        value: applicant.linkedinUrl ?? 'N/A',
        type: 'link',
      },
      {
        id: `${applicant.id}-portfolio`,
        label: 'Portfolio',
        value: applicant.portfolioUrl ?? 'N/A',
        type: 'link',
      },
      {
        id: `${applicant.id}-resume`,
        label: 'Resume',
        value: applicant.resumeUrl ?? 'N/A',
        type: 'file',
      },
      {
        id: `${applicant.id}-cover`,
        label: 'Cover Letter',
        value: applicant.coverLetter ?? 'N/A',
        type: 'textarea',
      },
    ],
    aiAnalysis: {
      score: applicant.profileScore ?? 0,
      summary: applicant.coverLetter ?? 'No AI analysis available yet.',
      strengths: [],
      concerns: [],
      recommendation: 'Review manually.',
    },
  };
}

export function RecruitmentActivePostingContent() {
  const queryClient = useQueryClient();
  const { data: jobs = [] } = useJobs({ status: 'PUBLISHED' });
  const { data: applicants = [] } = useApplicants();
  const closeJobMutation = useCloseJobMutation();

  const activePostingJobs = useMemo<ActiveJobItem[]>(() => {
    return jobs.map((job) => {
      const jobApplicants = applicants
        .filter((applicant) => applicant.jobId === job.job.id)
        .map(mapApplicant);

      return {
        id: job.job.id,
        slug: job.job.slug,
        title: job.job.title,
        levelTag: job.job.experienceLevel ?? undefined,
        statusLabel: 'Active Job',
        department: job.requestForm?.department ?? job.job.departmentId,
        employmentType: job.job.employmentType ?? 'FULL_TIME',
        workMode: job.job.workLocationType,
        openings: job.job.openings,
        applicantsCount: jobApplicants.length,
        viewsCount: job.job.viewsCount,
        postedAt: job.job.publishedAt ?? job.job.createdAt,
        closesAt: job.job.applicationDeadline ?? 'Not set',
        priority:
          job.requestForm?.priority === 'HIGH'
            ? 'high'
            : job.requestForm?.priority === 'LOW'
              ? 'low'
              : 'medium',
        summary:
          typeof job.job.summary === 'object'
            ? 'Job summary available.'
            : String(job.job.summary ?? ''),
        keyResponsibilities: job.job.responsibilities ?? [],
        requirements: job.job.requiredSkills ?? [],
        benefits: job.job.benefits ?? [],
        importanceOfHire: [job.requestForm?.businessJustification ?? 'N/A'],
        requestedBy: {
          name: job.requestForm?.requestedBy ?? 'Unknown',
          role: job.requestForm?.position ?? 'N/A',
          department: job.requestForm?.department ?? 'N/A',
        },
        hiringCommittee: [],
        revisionsFrom: [],
        approvedBy: [],
        applicants: jobApplicants,
        analytics: [
          { label: 'Applicants', value: jobApplicants.length },
          { label: 'Views', value: job.job.viewsCount },
          { label: 'Shortlisted', value: job.job.shortlistedCount },
        ],
        topMatch: {
          fullName: jobApplicants[0]?.fullName ?? 'N/A',
          phone: jobApplicants[0]?.phone ?? 'N/A',
          experience: jobApplicants[0]?.yearsOfExperience ?? 'N/A',
          salaryExpectation: jobApplicants[0]?.salaryExpectation ?? 'N/A',
          canStart: 'N/A',
          matchScore: jobApplicants[0]?.aiScore ?? 0,
        },
        pipelineStats: {
          total: jobApplicants.length,
          interviewed: job.job.interviewsCount,
          shortlist: job.job.shortlistedCount,
          rejected: Math.max(
            0,
            jobApplicants.length - job.job.shortlistedCount,
          ),
        },
        applicationFrequency: [],
        salaryDistribution: [],
        genderDistribution: [],
        experienceDistribution: [],
      };
    });
  }, [applicants, jobs]);

  async function handleCloseJob(job: ActiveJobItem): Promise<void> {
    try {
      await closeJobMutation.mutateAsync({
        jobId: job.id,
        reason: 'Closed from active posting screen',
      });
      toast.success('Job closed.');
      await queryClient.invalidateQueries({
        queryKey: queryKeys.hr.jobs.all(),
      });
    } catch (error) {
      console.error('Failed to close job', error);
      toast.error('Failed to close job.');
    }
  }

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
          <ActiveJobCard
            key={job.id}
            job={job}
            defaultExpanded={index === 0}
            onCloseJob={handleCloseJob}
          />
        ))}
      </section>
    </main>
  );
}
