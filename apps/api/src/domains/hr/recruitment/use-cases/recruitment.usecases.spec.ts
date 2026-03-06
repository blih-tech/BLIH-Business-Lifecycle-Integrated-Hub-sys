import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { SYSTEM_ROLES } from '../../../../shared/constants/system-roles.constant';
import { ApproveJobUseCase, SubmitJobUseCase } from './jobs.usecases';
import { UpdateJobApplicationStatusUseCase } from './applications.usecases';
import { UpdateInterviewUseCase } from './interviews.usecases';

const approvalTemplate = [
  {
    id: 'approval-finance',
    stage: 'FINANCE',
    level: 1,
    requiredRole: SYSTEM_ROLES.FINANCE_MANAGER,
    decision: 'PENDING',
    approverId: null,
    autoApproved: false,
    autoApprovalReason: null,
    comments: null,
    decidedAt: null,
    createdAt: new Date('2026-03-05T10:00:00.000Z'),
  },
  {
    id: 'approval-gm',
    stage: 'GM',
    level: 2,
    requiredRole: SYSTEM_ROLES.SUPERADMIN,
    decision: 'PENDING',
    approverId: null,
    autoApproved: false,
    autoApprovalReason: null,
    comments: null,
    decidedAt: null,
    createdAt: new Date('2026-03-05T10:00:00.000Z'),
  },
  {
    id: 'approval-hr',
    stage: 'HR_REVIEW',
    level: 3,
    requiredRole: SYSTEM_ROLES.HR_MANAGER,
    decision: 'PENDING',
    approverId: null,
    autoApproved: false,
    autoApprovalReason: null,
    comments: null,
    decidedAt: null,
    createdAt: new Date('2026-03-05T10:00:00.000Z'),
  },
];

const buildJob = (status: string, overrides: Record<string, unknown> = {}) => ({
  id: 'job-1',
  title: 'Senior Backend Engineer',
  slug: 'senior-backend-engineer',
  departmentId: 'dept-1',
  positionId: 'pos-1',
  description: 'Role description',
  summary: null,
  experienceLevel: 'SENIOR',
  contractType: 'PERMANENT',
  employmentType: 'FULL_TIME',
  workLocationType: 'HYBRID',
  remoteScope: null,
  city: null,
  country: null,
  openings: 1,
  salaryMin: 100000,
  salaryMax: 180000,
  currency: 'USD',
  salaryMode: 'NOT_SPECIFIED',
  benefits: [],
  status,
  financeApprovalStatus: 'PENDING_FOR_APPROVAL',
  gmApprovalStatus: 'PENDING_FOR_APPROVAL',
  hrApprovalStatus: 'PENDING_FOR_APPROVAL',
  creatorIsHr: false,
  applicationDeadline: new Date('2026-10-01T00:00:00.000Z'),
  publishedAt: null,
  createdById: 'creator-1',
  createdAt: new Date('2026-03-05T10:00:00.000Z'),
  updatedAt: new Date('2026-03-05T10:00:00.000Z'),
  approvals: approvalTemplate,
  skills: [{ id: 'skill-1' }],
  tools: [],
  responsibilities: [{ id: 'resp-1' }],
  ...overrides,
});

describe('Recruitment UseCases', () => {
  it('submits a ready draft job and creates approval stages', async () => {
    const tx = {
      jobApproval: {
        deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
        createMany: jest.fn().mockResolvedValue({ count: 3 }),
      },
      job: {
        update: jest.fn().mockResolvedValue(buildJob('PENDING_FOR_APPROVAL')),
      },
    };
    const prisma = {
      job: {
        findUnique: jest.fn().mockResolvedValue(buildJob('DRAFT')),
      },
      department: {
        findUnique: jest.fn().mockResolvedValue({ id: 'dept-1' }),
      },
      position: {
        findUnique: jest
          .fn()
          .mockResolvedValue({ id: 'pos-1', departmentId: 'dept-1' }),
      },
      $transaction: jest.fn().mockImplementation((callback) => callback(tx)),
    };

    const usecase = new SubmitJobUseCase(prisma as never);
    const result = await usecase.execute('job-1');

    expect(result.status).toBe('PENDING_FOR_APPROVAL');
    expect(tx.jobApproval.createMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({ stage: 'FINANCE', level: 1 }),
        expect.objectContaining({ stage: 'GM', level: 2 }),
        expect.objectContaining({ stage: 'HR_REVIEW', level: 3 }),
      ],
    });
  });

  it('rejects submit when strict readiness gate fails', async () => {
    const prisma = {
      job: {
        findUnique: jest
          .fn()
          .mockResolvedValue(buildJob('DRAFT', { skills: [] })),
      },
      department: {
        findUnique: jest.fn().mockResolvedValue({ id: 'dept-1' }),
      },
      position: {
        findUnique: jest
          .fn()
          .mockResolvedValue({ id: 'pos-1', departmentId: 'dept-1' }),
      },
      $transaction: jest.fn(),
    };
    const usecase = new SubmitJobUseCase(prisma as never);

    await expect(usecase.execute('job-1')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('allows GM approval before finance with explicit stage and keeps pending_for_approval', async () => {
    const tx = {
      jobApproval: {
        update: jest.fn().mockResolvedValue(undefined),
      },
      job: {
        update: jest.fn().mockResolvedValue(
          buildJob('PENDING_FOR_APPROVAL', {
            approvals: approvalTemplate.map((approval) =>
              approval.stage === 'GM'
                ? { ...approval, decision: 'APPROVED' }
                : approval,
            ),
          }),
        ),
      },
    };
    const prisma = {
      job: {
        findUnique: jest
          .fn()
          .mockResolvedValue(buildJob('PENDING_FOR_APPROVAL')),
      },
      $transaction: jest.fn().mockImplementation((callback) => callback(tx)),
    };
    const usecase = new ApproveJobUseCase(prisma as never);

    const result = await usecase.execute(
      'job-1',
      { decision: 'APPROVED', stage: 'GM' },
      {
        userId: 'gm-1',
        sub: 'gm-1',
        roles: [SYSTEM_ROLES.SUPERADMIN],
      } as never,
    );

    expect(result.status).toBe('PENDING_FOR_APPROVAL');
  });

  it('auto-approves HR after second parallel approval when creator is HR', async () => {
    const tx = {
      jobApproval: {
        update: jest.fn().mockResolvedValue(undefined),
      },
      job: {
        update: jest.fn().mockResolvedValue(
          buildJob('READY_TO_POST', {
            creatorIsHr: true,
            createdById: 'hr-creator-1',
            approvals: [
              { ...approvalTemplate[0], decision: 'APPROVED' },
              { ...approvalTemplate[1], decision: 'APPROVED' },
              {
                ...approvalTemplate[2],
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
          buildJob('PENDING_FOR_APPROVAL', {
            creatorIsHr: true,
            createdById: 'hr-creator-1',
            approvals: [
              { ...approvalTemplate[0], decision: 'PENDING' },
              { ...approvalTemplate[1], decision: 'APPROVED' },
              approvalTemplate[2],
            ],
          }),
        ),
      },
      $transaction: jest.fn().mockImplementation((callback) => callback(tx)),
    };
    const usecase = new ApproveJobUseCase(prisma as never);

    const result = await usecase.execute(
      'job-1',
      { decision: 'APPROVED', stage: 'FINANCE' },
      {
        userId: 'finance-1',
        sub: 'finance-1',
        roles: [SYSTEM_ROLES.FINANCE_MANAGER],
      } as never,
    );

    expect(result.status).toBe('READY_TO_POST');
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

  it('rejects immediately when any stage rejects', async () => {
    const tx = {
      jobApproval: {
        update: jest.fn().mockResolvedValue(undefined),
      },
      job: {
        update: jest
          .fn()
          .mockResolvedValue(buildJob('REJECTED', { status: 'REJECTED' })),
      },
    };
    const prisma = {
      job: {
        findUnique: jest
          .fn()
          .mockResolvedValue(buildJob('PENDING_FOR_APPROVAL')),
      },
      $transaction: jest.fn().mockImplementation((callback) => callback(tx)),
    };
    const usecase = new ApproveJobUseCase(prisma as never);

    const result = await usecase.execute(
      'job-1',
      { decision: 'REJECTED', stage: 'FINANCE' },
      {
        userId: 'finance-1',
        sub: 'finance-1',
        roles: [SYSTEM_ROLES.FINANCE_MANAGER],
      } as never,
    );

    expect(result.status).toBe('REJECTED');
  });

  it('enforces stage role before approving a job', async () => {
    const prisma = {
      job: {
        findUnique: jest
          .fn()
          .mockResolvedValue(buildJob('PENDING_FOR_APPROVAL')),
      },
      $transaction: jest.fn(),
    };
    const usecase = new ApproveJobUseCase(prisma as never);

    await expect(
      usecase.execute('job-1', { decision: 'APPROVED', stage: 'FINANCE' }, {
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
