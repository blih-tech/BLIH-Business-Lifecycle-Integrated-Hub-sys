import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { SYSTEM_ROLES } from '../../../../shared/constants/system-roles.constant';
import { ApproveJobUseCase, SubmitJobUseCase } from './jobs.usecases';
import { UpdateJobApplicationStatusUseCase } from './applications.usecases';
import { UpdateInterviewUseCase } from './interviews.usecases';

const buildJob = (status: string, overrides: Record<string, unknown> = {}) => ({
  id: 'job-1',
  title: 'Senior Backend Engineer',
  slug: 'senior-backend-engineer',
  departmentId: null,
  positionId: null,
  description: 'Role description',
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
  status,
  creatorIsHr: false,
  applicationDeadline: null,
  publishedAt: null,
  createdById: 'creator-1',
  createdAt: new Date('2026-03-05T10:00:00.000Z'),
  updatedAt: new Date('2026-03-05T10:00:00.000Z'),
  approvals: [],
  skills: [],
  tools: [],
  responsibilities: [],
  ...overrides,
});

describe('Recruitment UseCases', () => {
  it('submits a draft job and creates ordered approval stages', async () => {
    const tx = {
      jobApproval: {
        deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
        createMany: jest.fn().mockResolvedValue({ count: 3 }),
      },
      job: {
        update: jest.fn().mockResolvedValue(buildJob('PENDING_FINANCE')),
      },
    };
    const prisma = {
      job: {
        findUnique: jest
          .fn()
          .mockResolvedValue({ id: 'job-1', status: 'DRAFT' }),
      },
      $transaction: jest.fn().mockImplementation((callback) => callback(tx)),
    };
    const usecase = new SubmitJobUseCase(prisma as never);

    const result = await usecase.execute('job-1');

    expect(result.status).toBe('PENDING_FINANCE');
    expect(tx.jobApproval.createMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({ stage: 'FINANCE', level: 1 }),
        expect.objectContaining({ stage: 'GM', level: 2 }),
        expect.objectContaining({ stage: 'HR_REVIEW', level: 3 }),
      ],
    });
  });

  it('auto-approves HR review after GM approval when creator is HR', async () => {
    const gmApproval = {
      id: 'approval-gm',
      stage: 'GM',
      decision: 'PENDING',
      createdAt: new Date('2026-03-05T10:00:00.000Z'),
    };
    const hrApproval = {
      id: 'approval-hr',
      stage: 'HR_REVIEW',
      decision: 'PENDING',
      createdAt: new Date('2026-03-05T10:00:00.000Z'),
    };

    const tx = {
      jobApproval: {
        update: jest.fn().mockResolvedValue(undefined),
      },
      job: {
        update: jest.fn().mockResolvedValue(
          buildJob('APPROVED', {
            creatorIsHr: true,
            createdById: 'hr-creator-1',
            approvals: [
              { ...gmApproval, decision: 'APPROVED' },
              {
                ...hrApproval,
                decision: 'APPROVED',
                autoApproved: true,
                autoApprovalReason: 'CREATOR_HAS_HR_ROLE',
              },
            ],
          }),
        ),
      },
    };

    const prisma = {
      job: {
        findUnique: jest.fn().mockResolvedValue(
          buildJob('PENDING_GM', {
            creatorIsHr: true,
            createdById: 'hr-creator-1',
            approvals: [gmApproval, hrApproval],
          }),
        ),
      },
      $transaction: jest.fn().mockImplementation((callback) => callback(tx)),
    };
    const usecase = new ApproveJobUseCase(prisma as never);

    const result = await usecase.execute(
      'job-1',
      { decision: 'APPROVED', comments: 'GM approved' },
      {
        userId: 'gm-1',
        sub: 'gm-1',
        roles: [SYSTEM_ROLES.SUPERADMIN],
      } as never,
    );

    expect(result.status).toBe('APPROVED');
    expect(tx.jobApproval.update).toHaveBeenCalledTimes(2);
    expect(tx.jobApproval.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'approval-hr' },
        data: expect.objectContaining({
          decision: 'APPROVED',
          autoApproved: true,
          autoApprovalReason: 'CREATOR_HAS_HR_ROLE',
        }),
      }),
    );
  });

  it('enforces stage role before approving a job', async () => {
    const prisma = {
      job: {
        findUnique: jest.fn().mockResolvedValue(
          buildJob('PENDING_FINANCE', {
            approvals: [
              {
                id: 'approval-finance',
                stage: 'FINANCE',
                decision: 'PENDING',
                createdAt: new Date('2026-03-05T10:00:00.000Z'),
              },
            ],
          }),
        ),
      },
      $transaction: jest.fn(),
    };
    const usecase = new ApproveJobUseCase(prisma as never);

    await expect(
      usecase.execute('job-1', { decision: 'APPROVED' }, {
        userId: 'regular-user',
        sub: 'regular-user',
        roles: ['hr_assistant'],
      } as never),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects invalid job application status transitions', async () => {
    const prisma = {
      jobApplication: {
        findUnique: jest.fn().mockResolvedValue({ id: 'app-1', status: 'NEW' }),
        update: jest.fn(),
      },
    };
    const usecase = new UpdateJobApplicationStatusUseCase(prisma as never);

    await expect(
      usecase.execute('app-1', { status: 'HIRED' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects invalid interview status transitions', async () => {
    const prisma = {
      interview: {
        findUniqueOrThrow: jest
          .fn()
          .mockResolvedValue({ id: 'int-1', status: 'COMPLETED' }),
        update: jest.fn(),
      },
    };
    const usecase = new UpdateInterviewUseCase(prisma as never);

    await expect(
      usecase.execute('int-1', { status: 'SCHEDULED' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
