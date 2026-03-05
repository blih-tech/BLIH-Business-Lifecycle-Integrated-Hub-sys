import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { SYSTEM_ROLES } from '../../src/shared/constants/system-roles.constant';
import {
  ApproveJobUseCase,
  CreateJobUseCase,
  PublishJobUseCase,
  SubmitJobUseCase,
} from '../../src/domains/hr/recruitment/use-cases/jobs.usecases';
import { CreateCandidateUseCase } from '../../src/domains/hr/recruitment/use-cases/candidates.usecases';
import {
  CreateJobApplicationUseCase,
  UpdateJobApplicationStatusUseCase,
} from '../../src/domains/hr/recruitment/use-cases/applications.usecases';

type JobState = {
  id: string;
  title: string;
  slug: string;
  status: string;
  creatorIsHr: boolean;
  createdById: string | null;
  approvals: Array<{
    id: string;
    stage: 'FINANCE' | 'GM' | 'HR_REVIEW';
    level: number;
    requiredRole: string;
    decision: 'PENDING' | 'APPROVED' | 'REJECTED';
    approverId: string | null;
    autoApproved: boolean;
    autoApprovalReason: string | null;
    comments: string | null;
    decidedAt: Date | null;
    createdAt: Date;
  }>;
  skills: unknown[];
  tools: unknown[];
  responsibilities: unknown[];
  createdAt: Date;
  updatedAt: Date;
};

function createFakePrisma() {
  const jobs = new Map<string, JobState>();
  const candidates = new Map<string, any>();
  const applications = new Map<string, any>();

  let jobSeq = 1;
  let approvalSeq = 1;
  let candidateSeq = 1;
  let applicationSeq = 1;

  const buildJobResponse = (job: JobState) => ({
    ...job,
    departmentId: null,
    positionId: null,
    description: 'desc',
    summary: null,
    experienceLevel: null,
    contractType: 'PERMANENT',
    employmentType: 'FULL_TIME',
    workLocationType: 'HYBRID',
    remoteScope: null,
    city: null,
    country: null,
    openings: 1,
    salaryMin: null,
    salaryMax: null,
    currency: 'USD',
    benefits: [],
    applicationDeadline: null,
    publishedAt: job.status === 'PUBLISHED' ? new Date() : null,
  });

  const prisma = {
    job: {
      findUnique: jest.fn(async ({ where }: any) => {
        if (where?.slug) {
          const found = [...jobs.values()].find(
            (job) => job.slug === where.slug,
          );
          return found ? { id: found.id } : null;
        }
        if (where?.id) {
          const found = jobs.get(where.id);
          return found ? buildJobResponse(found) : null;
        }
        return null;
      }),
      create: jest.fn(async ({ data }: any) => {
        const id = `job-${jobSeq++}`;
        const now = new Date();
        const job: JobState = {
          id,
          title: data.title,
          slug: data.slug,
          status: 'DRAFT',
          creatorIsHr: Boolean(data.creatorIsHr),
          createdById: data.createdById ?? null,
          approvals: [],
          skills: [],
          tools: [],
          responsibilities: [],
          createdAt: now,
          updatedAt: now,
        };
        jobs.set(id, job);
        return buildJobResponse(job);
      }),
      update: jest.fn(async ({ where, data }: any) => {
        const job = jobs.get(where.id);
        if (!job) throw new Error('job not found');
        if (data.status) job.status = data.status;
        job.updatedAt = new Date();
        jobs.set(job.id, job);
        return buildJobResponse(job);
      }),
      findMany: jest.fn(async () =>
        [...jobs.values()].map((job) => buildJobResponse(job)),
      ),
    },
    jobApproval: {
      deleteMany: jest.fn(async ({ where }: any) => {
        const job = jobs.get(where.jobId);
        if (job) job.approvals = [];
        return { count: 0 };
      }),
      createMany: jest.fn(async ({ data }: any) => {
        const jobId = data[0].jobId;
        const job = jobs.get(jobId);
        if (!job) throw new Error('job not found');
        job.approvals = data.map((row: any) => ({
          id: `approval-${approvalSeq++}`,
          stage: row.stage,
          level: row.level,
          requiredRole: row.requiredRole,
          decision: 'PENDING',
          approverId: null,
          autoApproved: false,
          autoApprovalReason: null,
          comments: null,
          decidedAt: null,
          createdAt: new Date(),
        }));
        return { count: job.approvals.length };
      }),
      update: jest.fn(async ({ where, data }: any) => {
        for (const job of jobs.values()) {
          const approval = job.approvals.find((row) => row.id === where.id);
          if (!approval) continue;
          approval.approverId = data.approverId ?? approval.approverId;
          approval.decision = data.decision ?? approval.decision;
          approval.autoApproved = data.autoApproved ?? approval.autoApproved;
          approval.autoApprovalReason =
            data.autoApprovalReason ?? approval.autoApprovalReason;
          approval.comments = data.comments ?? approval.comments;
          approval.decidedAt = data.decidedAt ?? approval.decidedAt;
          return approval;
        }
        throw new Error('approval not found');
      }),
    },
    candidate: {
      findUnique: jest.fn(async ({ where }: any) => {
        if (where.emailNormalized) {
          const found = [...candidates.values()].find(
            (candidate) => candidate.emailNormalized === where.emailNormalized,
          );
          return found ?? null;
        }
        return candidates.get(where.id) ?? null;
      }),
      create: jest.fn(async ({ data }: any) => {
        const id = `candidate-${candidateSeq++}`;
        const candidate = {
          id,
          ...data,
          skills: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        candidates.set(id, candidate);
        return candidate;
      }),
      findUniqueOrThrow: jest.fn(async ({ where }: any) => {
        const candidate = candidates.get(where.id);
        if (!candidate) throw new Error('candidate not found');
        return candidate;
      }),
      findMany: jest.fn(async () => [...candidates.values()]),
      update: jest.fn(async ({ where, data }: any) => {
        const candidate = candidates.get(where.id);
        if (!candidate) throw new Error('candidate not found');
        Object.assign(candidate, data, { updatedAt: new Date() });
        candidates.set(where.id, candidate);
        return candidate;
      }),
    },
    candidateSkill: {
      deleteMany: jest.fn(async () => ({ count: 0 })),
      createMany: jest.fn(async () => ({ count: 0 })),
    },
    jobApplication: {
      findUnique: jest.fn(async ({ where }: any) => {
        if (where?.jobId_candidateId) {
          const found = [...applications.values()].find(
            (application) =>
              application.jobId === where.jobId_candidateId.jobId &&
              application.candidateId === where.jobId_candidateId.candidateId,
          );
          return found ?? null;
        }
        return applications.get(where.id) ?? null;
      }),
      create: jest.fn(async ({ data }: any) => {
        const id = `application-${applicationSeq++}`;
        const application = {
          id,
          jobId: data.jobId,
          candidateId: data.candidateId,
          status: 'NEW',
          coverLetter: data.coverLetter ?? null,
          expectedSalary: data.expectedSalary ?? null,
          sourceSnapshot: data.sourceSnapshot ?? null,
          appliedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        applications.set(id, application);
        return application;
      }),
      update: jest.fn(async ({ where, data }: any) => {
        const application = applications.get(where.id);
        if (!application) throw new Error('application not found');
        Object.assign(application, data, { updatedAt: new Date() });
        applications.set(where.id, application);
        return application;
      }),
      findMany: jest.fn(async () => [...applications.values()]),
    },
    $transaction: jest.fn(async (callback: any) => {
      const tx = {
        jobApproval: prisma.jobApproval,
        job: prisma.job,
        candidate: prisma.candidate,
        candidateSkill: prisma.candidateSkill,
      };
      return callback(tx);
    }),
  };

  return prisma;
}

describe('Recruitment flow (integration)', () => {
  it('completes happy path from draft to published to hired', async () => {
    const prisma = createFakePrisma();
    const notifications = {
      notifyUsers: jest.fn().mockResolvedValue(undefined),
    };

    const createJob = new CreateJobUseCase(prisma as never);
    const submitJob = new SubmitJobUseCase(prisma as never);
    const approveJob = new ApproveJobUseCase(prisma as never);
    const publishJob = new PublishJobUseCase(prisma as never);
    const createCandidate = new CreateCandidateUseCase(prisma as never);
    const createApplication = new CreateJobApplicationUseCase(
      prisma as never,
      notifications as never,
    );
    const updateApplicationStatus = new UpdateJobApplicationStatusUseCase(
      prisma as never,
    );

    const createdJob = await createJob.execute(
      {
        title: 'Senior Backend Engineer',
        description: 'desc',
        contractType: 'PERMANENT',
        workLocationType: 'HYBRID',
      } as never,
      {
        userId: 'dept-head-1',
        sub: 'dept-head-1',
        roles: ['department_head'],
      } as never,
    );

    const submittedJob = await submitJob.execute(createdJob.id);
    expect(submittedJob.status).toBe('PENDING_FINANCE');

    const financeApproved = await approveJob.execute(
      createdJob.id,
      { decision: 'APPROVED' },
      {
        userId: 'finance-1',
        sub: 'finance-1',
        roles: [SYSTEM_ROLES.FINANCE_MANAGER],
      } as never,
    );
    expect(financeApproved.status).toBe('PENDING_GM');

    const gmApproved = await approveJob.execute(
      createdJob.id,
      { decision: 'APPROVED' },
      {
        userId: 'gm-1',
        sub: 'gm-1',
        roles: [SYSTEM_ROLES.SUPERADMIN],
      } as never,
    );
    expect(gmApproved.status).toBe('PENDING_HR_REVIEW');

    const hrApproved = await approveJob.execute(
      createdJob.id,
      { decision: 'APPROVED' },
      {
        userId: 'hr-1',
        sub: 'hr-1',
        roles: [SYSTEM_ROLES.HR_MANAGER],
      } as never,
    );
    expect(hrApproved.status).toBe('APPROVED');

    const published = await publishJob.execute(createdJob.id);
    expect(published.status).toBe('PUBLISHED');

    const candidate = await createCandidate.execute({
      firstName: 'Abel',
      lastName: 'Tesfaye',
      email: 'abel@example.com',
      source: 'COMPANY_SITE',
    });
    const application = await createApplication.execute({
      jobId: createdJob.id,
      candidateId: candidate.id,
    });
    expect(application.status).toBe('NEW');

    await updateApplicationStatus.execute(application.id, {
      status: 'SCREENING',
    });
    await updateApplicationStatus.execute(application.id, {
      status: 'SHORTLISTED',
    });
    await updateApplicationStatus.execute(application.id, {
      status: 'INTERVIEW_STAGE',
    });
    await updateApplicationStatus.execute(application.id, {
      status: 'OFFER_PENDING',
    });
    const hired = await updateApplicationStatus.execute(application.id, {
      status: 'HIRED',
    });

    expect(hired.status).toBe('HIRED');
  });

  it('blocks forbidden stage skips and wrong role approvals', async () => {
    const prisma = createFakePrisma();
    const createJob = new CreateJobUseCase(prisma as never);
    const submitJob = new SubmitJobUseCase(prisma as never);
    const approveJob = new ApproveJobUseCase(prisma as never);
    const publishJob = new PublishJobUseCase(prisma as never);

    const createdJob = await createJob.execute(
      {
        title: 'Backend Engineer',
        description: 'desc',
        contractType: 'PERMANENT',
        workLocationType: 'REMOTE',
      } as never,
      {
        userId: 'dept-head-2',
        sub: 'dept-head-2',
        roles: ['department_head'],
      } as never,
    );

    await expect(publishJob.execute(createdJob.id)).rejects.toBeInstanceOf(
      BadRequestException,
    );

    await submitJob.execute(createdJob.id);
    await expect(
      approveJob.execute(createdJob.id, { decision: 'APPROVED' }, {
        userId: 'hr-2',
        sub: 'hr-2',
        roles: [SYSTEM_ROLES.HR_MANAGER],
      } as never),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
