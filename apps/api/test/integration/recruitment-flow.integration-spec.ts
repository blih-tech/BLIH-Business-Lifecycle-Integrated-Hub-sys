import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { SYSTEM_ROLES } from '../../src/shared/constants/system-roles.constant';
import {
  ApproveJobUseCase,
  CreateJobUseCase,
  PublishJobUseCase,
  SubmitJobUseCase,
  UpsertJobResponsibilitiesUseCase,
  UpsertJobSkillsUseCase,
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
  departmentId: string;
  positionId: string;
  description: string;
  summary: string | null;
  experienceLevel: string;
  contractType: string;
  employmentType: string | null;
  workLocationType: string;
  remoteScope: string | null;
  city: string | null;
  country: string | null;
  openings: number;
  salaryMin: number;
  salaryMax: number;
  currency: string;
  benefits: string[];
  creatorIsHr: boolean;
  applicationDeadline: Date;
  publishedAt: Date | null;
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
  skills: Array<{
    id: string;
    name: string;
    level: string | null;
    required: boolean;
    order: number | null;
  }>;
  tools: Array<{
    id: string;
    name: string;
    order: number | null;
  }>;
  responsibilities: Array<{
    id: string;
    description: string;
    order: number | null;
  }>;
  createdAt: Date;
  updatedAt: Date;
};

function createFakePrisma() {
  const jobs = new Map<string, JobState>();
  const candidates = new Map<string, any>();
  const applications = new Map<string, any>();

  const departments = new Map<string, { id: string }>([
    ['dept-1', { id: 'dept-1' }],
  ]);
  const positions = new Map<string, { id: string; departmentId: string }>([
    ['pos-1', { id: 'pos-1', departmentId: 'dept-1' }],
  ]);

  let jobSeq = 1;
  let approvalSeq = 1;
  let skillSeq = 1;
  let responsibilitySeq = 1;
  let candidateSeq = 1;
  let applicationSeq = 1;

  const buildJobResponse = (job: JobState) => ({
    ...job,
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
  });

  const prisma = {
    department: {
      findUnique: jest.fn(async ({ where }: any) => {
        return departments.get(where.id) ?? null;
      }),
    },
    position: {
      findUnique: jest.fn(async ({ where }: any) => {
        return positions.get(where.id) ?? null;
      }),
    },
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
      findUniqueOrThrow: jest.fn(async ({ where }: any) => {
        const found = jobs.get(where.id);
        if (!found) {
          throw new Error('job not found');
        }
        return { id: found.id };
      }),
      create: jest.fn(async ({ data }: any) => {
        const id = `job-${jobSeq++}`;
        const now = new Date();
        const job: JobState = {
          id,
          title: data.title,
          slug: data.slug,
          status: 'DRAFT',
          departmentId: data.departmentId,
          positionId: data.positionId,
          description: data.description,
          summary: data.summary ?? null,
          experienceLevel: data.experienceLevel,
          contractType: data.contractType,
          employmentType: data.employmentType ?? null,
          workLocationType: data.workLocationType,
          remoteScope: data.remoteScope ?? null,
          city: data.city ?? null,
          country: data.country ?? null,
          openings: data.openings,
          salaryMin: data.salaryMin,
          salaryMax: data.salaryMax,
          currency: data.currency,
          benefits: data.benefits ?? [],
          creatorIsHr: Boolean(data.creatorIsHr),
          applicationDeadline: data.applicationDeadline,
          publishedAt: null,
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
        Object.assign(job, data, { updatedAt: new Date() });
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
    jobSkill: {
      deleteMany: jest.fn(async ({ where }: any) => {
        const job = jobs.get(where.jobId);
        if (job) job.skills = [];
        return { count: 0 };
      }),
      createMany: jest.fn(async ({ data }: any) => {
        const job = jobs.get(data[0]?.jobId);
        if (!job) throw new Error('job not found');
        job.skills = data.map((item: any) => ({
          id: `skill-${skillSeq++}`,
          name: item.name,
          level: item.level ?? null,
          required: item.required ?? true,
          order: item.order ?? null,
        }));
        return { count: job.skills.length };
      }),
      findMany: jest.fn(async ({ where }: any) => {
        const job = jobs.get(where.jobId);
        return job?.skills ?? [];
      }),
    },
    jobResponsibility: {
      deleteMany: jest.fn(async ({ where }: any) => {
        const job = jobs.get(where.jobId);
        if (job) job.responsibilities = [];
        return { count: 0 };
      }),
      createMany: jest.fn(async ({ data }: any) => {
        const job = jobs.get(data[0]?.jobId);
        if (!job) throw new Error('job not found');
        job.responsibilities = data.map((item: any) => ({
          id: `responsibility-${responsibilitySeq++}`,
          description: item.description,
          order: item.order ?? null,
        }));
        return { count: job.responsibilities.length };
      }),
      findMany: jest.fn(async ({ where }: any) => {
        const job = jobs.get(where.jobId);
        return job?.responsibilities ?? [];
      }),
    },
    jobTool: {
      deleteMany: jest.fn(async () => ({ count: 0 })),
      createMany: jest.fn(async () => ({ count: 0 })),
      findMany: jest.fn(async () => []),
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
        jobSkill: prisma.jobSkill,
        jobTool: prisma.jobTool,
        jobResponsibility: prisma.jobResponsibility,
      };
      return callback(tx);
    }),
  };

  return prisma;
}

describe('Recruitment flow (integration)', () => {
  it('completes happy path from draft to published to hired with parallel GM/Finance', async () => {
    const prisma = createFakePrisma();
    const notifications = {
      notifyUsers: jest.fn().mockResolvedValue(undefined),
    };

    const createJob = new CreateJobUseCase(prisma as never);
    const upsertSkills = new UpsertJobSkillsUseCase(prisma as never);
    const upsertResponsibilities = new UpsertJobResponsibilitiesUseCase(
      prisma as never,
    );
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
        departmentId: 'dept-1',
        positionId: 'pos-1',
        description: 'desc',
        experienceLevel: 'SENIOR',
        contractType: 'PERMANENT',
        employmentType: 'FULL_TIME',
        workLocationType: 'HYBRID',
        openings: 1,
        salaryMin: 100000,
        salaryMax: 180000,
        currency: 'USD',
        applicationDeadline: '2026-10-01T00:00:00.000Z',
      } as never,
      {
        userId: 'dept-head-1',
        sub: 'dept-head-1',
        roles: ['department_head'],
      } as never,
    );

    await upsertSkills.execute(createdJob.id, {
      skills: [{ name: 'TypeScript', required: true }],
    });
    await upsertResponsibilities.execute(createdJob.id, {
      responsibilities: [{ description: 'Design backend architecture.' }],
    });

    const submittedJob = await submitJob.execute(createdJob.id);
    expect(submittedJob.status).toBe('PENDING_FINANCE');

    const gmApproved = await approveJob.execute(
      createdJob.id,
      { decision: 'APPROVED', stage: 'GM' },
      {
        userId: 'gm-1',
        sub: 'gm-1',
        roles: [SYSTEM_ROLES.SUPERADMIN],
      } as never,
    );
    expect(gmApproved.status).toBe('PENDING_FINANCE');

    const financeApproved = await approveJob.execute(
      createdJob.id,
      { decision: 'APPROVED', stage: 'FINANCE' },
      {
        userId: 'finance-1',
        sub: 'finance-1',
        roles: [SYSTEM_ROLES.FINANCE_MANAGER],
      } as never,
    );
    expect(financeApproved.status).toBe('PENDING_HR_REVIEW');

    const hrApproved = await approveJob.execute(
      createdJob.id,
      { decision: 'APPROVED', stage: 'HR_REVIEW' },
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

  it('blocks submit when incomplete and blocks wrong-role approvals', async () => {
    const prisma = createFakePrisma();
    const createJob = new CreateJobUseCase(prisma as never);
    const submitJob = new SubmitJobUseCase(prisma as never);
    const approveJob = new ApproveJobUseCase(prisma as never);
    const upsertSkills = new UpsertJobSkillsUseCase(prisma as never);
    const upsertResponsibilities = new UpsertJobResponsibilitiesUseCase(
      prisma as never,
    );

    const createdJob = await createJob.execute(
      {
        title: 'Backend Engineer',
        departmentId: 'dept-1',
        positionId: 'pos-1',
        description: 'desc',
        experienceLevel: 'MID',
        contractType: 'PERMANENT',
        workLocationType: 'REMOTE',
        openings: 1,
        salaryMin: 70000,
        salaryMax: 110000,
        currency: 'USD',
        applicationDeadline: '2026-10-01T00:00:00.000Z',
      } as never,
      {
        userId: 'dept-head-2',
        sub: 'dept-head-2',
        roles: ['department_head'],
      } as never,
    );

    await expect(submitJob.execute(createdJob.id)).rejects.toBeInstanceOf(
      BadRequestException,
    );

    await upsertSkills.execute(createdJob.id, {
      skills: [{ name: 'Node.js', required: true }],
    });
    await upsertResponsibilities.execute(createdJob.id, {
      responsibilities: [{ description: 'Build APIs.' }],
    });

    await submitJob.execute(createdJob.id);
    await expect(
      approveJob.execute(
        createdJob.id,
        { decision: 'APPROVED', stage: 'FINANCE' },
        {
          userId: 'hr-2',
          sub: 'hr-2',
          roles: [SYSTEM_ROLES.HR_MANAGER],
        } as never,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
