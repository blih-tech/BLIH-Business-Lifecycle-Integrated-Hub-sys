import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { SYSTEM_ROLES } from '../../../../shared/constants/system-roles.constant';
import { ApproveJobUseCase, SubmitJobUseCase } from './jobs.usecases';
import { UpdateApplicantStatusUseCase } from './applicants.usecases';
import {
  CreateInterviewUseCase,
  UpdateInterviewParticipantAttendanceUseCase,
  UpdateInterviewUseCase,
  UpsertInterviewFeedbackUseCase,
} from './interviews.usecases';

type ApprovalDepartment = 'FINANCE' | 'GM' | 'HR';
type ApprovalStatus = 'PENDING_FOR_APPROVAL' | 'APPROVED' | 'REJECTED';

const fixedNow = new Date('2026-03-05T10:00:00.000Z');

const makeApprovalStep = (
  department: ApprovalDepartment,
  level: number,
  status: ApprovalStatus = 'PENDING_FOR_APPROVAL',
  overrides: Record<string, unknown> = {},
) => ({
  id: `approval-${department.toLowerCase()}`,
  jobRequestFormId: 'request-1',
  department,
  level,
  status,
  approverId: null,
  currentNote: null,
  decidedAt: null,
  createdAt: fixedNow,
  updatedAt: fixedNow,
  history: [],
  ...overrides,
});

const pendingApprovals = () => [
  makeApprovalStep('FINANCE', 1),
  makeApprovalStep('GM', 2),
  makeApprovalStep('HR', 3),
];

const buildJob = (
  status: string,
  approvals: ReturnType<typeof pendingApprovals> = pendingApprovals(),
  overrides: Record<string, unknown> = {},
) => ({
  id: 'job-1',
  title: 'Senior Backend Engineer',
  slug: 'senior-backend-engineer',
  departmentId: 'dept-1',
  positionId: 'pos-1',
  description: { type: 'doc', content: [{ type: 'paragraph', text: 'Role' }] },
  summary: null,
  experienceLevel: 'SENIOR',
  contractType: 'PERMANENT',
  employmentType: 'FULL_TIME',
  workLocationType: 'HYBRID',
  city: null,
  country: null,
  openings: 1,
  salaryMin: 100000,
  salaryMax: 180000,
  currency: 'USD',
  salaryMode: 'NOT_SPECIFIED',
  benefits: [],
  creatorIsHr: false,
  applicationDeadline: new Date('2026-10-01T00:00:00.000Z'),
  publishedAt: null,
  closedAt: null,
  closingReason: null,
  viewsCount: 0,
  applicationsCount: 0,
  shortlistedCount: 0,
  interviewsCount: 0,
  offersCount: 0,
  hiresCount: 0,
  createdById: 'creator-1',
  createdAt: fixedNow,
  updatedAt: fixedNow,
  requiredSkills: ['typescript'],
  preferredSkills: [],
  tools: [],
  responsibilities: ['Own delivery'],
  requestForm: {
    id: 'request-1',
    jobId: 'job-1',
    status,
    priority: 'MEDIUM',
    draftedAt: fixedNow,
    pendingApprovalAt: fixedNow,
    readyToPostAt: null,
    rejectedAt: null,
    jobTitle: 'Senior Backend Engineer',
    departmentId: 'dept-1',
    requestedBy: 'System',
    positionId: 'pos-1',
    requestType: 'NEW',
    replaceForUserId: null,
    businessJustification: 'Need backfill',
    employmentType: 'FULL_TIME',
    workMode: 'HYBRID',
    urgency: 'MEDIUM',
    neededByDate: new Date('2026-10-01T00:00:00.000Z'),
    approvals,
  },
  applicationForm: null,
  ...overrides,
});

const buildSubmitCandidate = (
  status: 'DRAFT' | 'REJECTED' | 'PENDING_FOR_APPROVAL',
  overrides: Record<string, unknown> = {},
) => ({
  id: 'job-1',
  title: 'Senior Backend Engineer',
  description: { type: 'doc', content: [{ type: 'paragraph', text: 'Role' }] },
  departmentId: 'dept-1',
  positionId: 'pos-1',
  experienceLevel: 'SENIOR',
  contractType: 'PERMANENT',
  workLocationType: 'HYBRID',
  openings: 1,
  salaryMin: 100000,
  salaryMax: 180000,
  currency: 'USD',
  applicationDeadline: new Date('2026-10-01T00:00:00.000Z'),
  requiredSkills: ['TypeScript'],
  responsibilities: ['Own delivery'],
  creatorIsHr: false,
  createdById: 'creator-1',
  requestForm: { id: 'request-1', status },
  ...overrides,
});

describe('Recruitment UseCases', () => {
  it('submits a ready draft job and creates approval stages', async () => {
    const tx = {
      jobApprovalStep: {
        deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
        createMany: jest.fn().mockResolvedValue({ count: 3 }),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      jobApprovalHistory: {
        create: jest.fn(),
      },
      job: {
        update: jest
          .fn()
          .mockResolvedValue(
            buildJob('PENDING_FOR_APPROVAL', pendingApprovals()),
          ),
      },
    };
    const prisma = {
      job: {
        findUnique: jest.fn().mockResolvedValue(buildSubmitCandidate('DRAFT')),
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

    expect(result.requestForm?.status).toBe('PENDING_FOR_APPROVAL');
    expect(tx.jobApprovalStep.createMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({ department: 'FINANCE', level: 1 }),
        expect.objectContaining({ department: 'GM', level: 2 }),
        expect.objectContaining({ department: 'HR', level: 3 }),
      ],
    });
    expect(tx.jobApprovalStep.findFirst).not.toHaveBeenCalled();
    expect(tx.jobApprovalHistory.create).not.toHaveBeenCalled();
  });

  it('auto-approves HR stage at submit when creator is HR', async () => {
    const hrDecidedAt = new Date('2026-03-06T09:00:00.000Z');
    const autoApprovedApprovals = [
      makeApprovalStep('FINANCE', 1),
      makeApprovalStep('GM', 2),
      makeApprovalStep('HR', 3, 'APPROVED', {
        approverId: 'hr-creator-1',
        currentNote: 'Auto-approved because creator has HR role',
        decidedAt: hrDecidedAt,
        history: [{ reason: 'CREATOR_HAS_HR_ROLE', createdAt: hrDecidedAt }],
      }),
    ];
    const tx = {
      jobApprovalStep: {
        deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
        createMany: jest.fn().mockResolvedValue({ count: 3 }),
        findFirst: jest.fn().mockResolvedValue({ id: 'approval-hr' }),
        update: jest.fn().mockResolvedValue(undefined),
      },
      jobApprovalHistory: {
        create: jest.fn().mockResolvedValue(undefined),
      },
      job: {
        update: jest.fn().mockResolvedValue(
          buildJob('PENDING_FOR_APPROVAL', autoApprovedApprovals, {
            creatorIsHr: true,
            createdById: 'hr-creator-1',
          }),
        ),
      },
    };
    const prisma = {
      job: {
        findUnique: jest.fn().mockResolvedValue(
          buildSubmitCandidate('DRAFT', {
            creatorIsHr: true,
            createdById: 'hr-creator-1',
          }),
        ),
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

    expect(tx.jobApprovalStep.update).toHaveBeenCalledWith({
      where: { id: 'approval-hr' },
      data: expect.objectContaining({
        approverId: 'hr-creator-1',
        status: 'APPROVED',
        currentNote: 'Auto-approved because creator has HR role',
      }),
    });
    expect(tx.jobApprovalHistory.create).toHaveBeenCalledWith({
      data: {
        approvalStepId: 'approval-hr',
        toStatus: 'APPROVED',
        changedById: 'hr-creator-1',
        reason: 'CREATOR_HAS_HR_ROLE',
      },
    });
    expect(result.requestForm?.status).toBe('PENDING_FOR_APPROVAL');
    expect(result.requestForm?.hrApprovalStatus).toBe('APPROVED');
  });

  it('allows HR approval while finance and gm are still pending', async () => {
    const nextApprovals = [
      makeApprovalStep('FINANCE', 1),
      makeApprovalStep('GM', 2),
      makeApprovalStep('HR', 3, 'APPROVED', {
        approverId: 'hr-1',
        currentNote: 'HR approved',
        decidedAt: fixedNow,
      }),
    ];
    const tx = {
      jobApprovalStep: {
        update: jest.fn().mockResolvedValue(undefined),
      },
      jobApprovalHistory: {
        create: jest.fn().mockResolvedValue(undefined),
      },
      job: {
        update: jest
          .fn()
          .mockResolvedValue(buildJob('PENDING_FOR_APPROVAL', nextApprovals)),
      },
    };
    const prisma = {
      job: {
        findUnique: jest
          .fn()
          .mockResolvedValue(
            buildJob('PENDING_FOR_APPROVAL', pendingApprovals()),
          ),
      },
      $transaction: jest.fn().mockImplementation((callback) => callback(tx)),
    };
    const usecase = new ApproveJobUseCase(prisma as never);

    const result = await usecase.execute('job-1', { decision: 'APPROVED' }, {
      userId: 'hr-1',
      sub: 'hr-1',
      roles: [SYSTEM_ROLES.HR_MANAGER],
    } as never);

    expect(tx.jobApprovalStep.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'approval-hr' } }),
    );
    expect(result.requestForm?.status).toBe('PENDING_FOR_APPROVAL');
    expect(result.requestForm?.hrApprovalStatus).toBe('APPROVED');
  });

  it('for multi-role approver decides only one stage per call (lowest level first)', async () => {
    const nextApprovals = [
      makeApprovalStep('FINANCE', 1, 'APPROVED', {
        approverId: 'finance-gm-1',
        currentNote: 'Approved',
        decidedAt: fixedNow,
      }),
      makeApprovalStep('GM', 2),
      makeApprovalStep('HR', 3),
    ];
    const tx = {
      jobApprovalStep: {
        update: jest.fn().mockResolvedValue(undefined),
      },
      jobApprovalHistory: {
        create: jest.fn().mockResolvedValue(undefined),
      },
      job: {
        update: jest
          .fn()
          .mockResolvedValue(buildJob('PENDING_FOR_APPROVAL', nextApprovals)),
      },
    };
    const prisma = {
      job: {
        findUnique: jest
          .fn()
          .mockResolvedValue(
            buildJob('PENDING_FOR_APPROVAL', pendingApprovals()),
          ),
      },
      $transaction: jest.fn().mockImplementation((callback) => callback(tx)),
    };
    const usecase = new ApproveJobUseCase(prisma as never);

    await usecase.execute('job-1', { decision: 'APPROVED' }, {
      userId: 'finance-gm-1',
      sub: 'finance-gm-1',
      roles: [SYSTEM_ROLES.FINANCE_MANAGER, SYSTEM_ROLES.SUPERADMIN],
    } as never);

    expect(tx.jobApprovalStep.update).toHaveBeenCalledTimes(1);
    expect(tx.jobApprovalStep.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'approval-finance' } }),
    );
  });

  it('rejects immediately and freezes further approvals', async () => {
    const rejectedApprovals = [
      makeApprovalStep('FINANCE', 1, 'REJECTED', {
        approverId: 'finance-1',
        currentNote: 'Budget denied',
        decidedAt: fixedNow,
      }),
      makeApprovalStep('GM', 2),
      makeApprovalStep('HR', 3),
    ];
    const tx = {
      jobApprovalStep: {
        update: jest.fn().mockResolvedValue(undefined),
      },
      jobApprovalHistory: {
        create: jest.fn().mockResolvedValue(undefined),
      },
      job: {
        update: jest
          .fn()
          .mockResolvedValue(buildJob('REJECTED', rejectedApprovals)),
      },
    };
    const prismaReject = {
      job: {
        findUnique: jest
          .fn()
          .mockResolvedValue(
            buildJob('PENDING_FOR_APPROVAL', pendingApprovals()),
          ),
      },
      $transaction: jest.fn().mockImplementation((callback) => callback(tx)),
    };
    const rejectUsecase = new ApproveJobUseCase(prismaReject as never);

    const rejected = await rejectUsecase.execute(
      'job-1',
      { decision: 'REJECTED', comments: 'Budget denied' },
      {
        userId: 'finance-1',
        sub: 'finance-1',
        roles: [SYSTEM_ROLES.FINANCE_MANAGER],
      } as never,
    );

    expect(rejected.requestForm?.status).toBe('REJECTED');

    const prismaFrozen = {
      job: {
        findUnique: jest
          .fn()
          .mockResolvedValue(buildJob('REJECTED', rejectedApprovals)),
      },
      $transaction: jest.fn(),
    };
    const frozenUsecase = new ApproveJobUseCase(prismaFrozen as never);

    await expect(
      frozenUsecase.execute('job-1', { decision: 'APPROVED' }, {
        userId: 'gm-1',
        sub: 'gm-1',
        roles: [SYSTEM_ROLES.SUPERADMIN],
      } as never),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(prismaFrozen.$transaction).not.toHaveBeenCalled();
  });

  it('enforces approval role checks', async () => {
    const prisma = {
      job: {
        findUnique: jest
          .fn()
          .mockResolvedValue(
            buildJob('PENDING_FOR_APPROVAL', pendingApprovals()),
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

  it('rejects submit when strict readiness gate fails', async () => {
    const prisma = {
      job: {
        findUnique: jest.fn().mockResolvedValue(
          buildSubmitCandidate('DRAFT', {
            requiredSkills: [],
          }),
        ),
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

  it('rejects invalid applicant status transitions', async () => {
    const prisma = {
      applicant: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'app-1',
          status: 'APPLIED',
          jobId: 'job-1',
        }),
        update: jest.fn(),
      },
    };
    const usecase = new UpdateApplicantStatusUseCase(prisma as never);

    await expect(
      usecase.execute('app-1', { status: 'HIRED' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects invalid interview status transitions', async () => {
    const prisma = {
      interviewSession: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'int-1',
          status: 'COMPLETED',
          jobId: 'job-1',
          round: 1,
          participants: [],
          interviewers: [],
        }),
      },
    };
    const usecase = new UpdateInterviewUseCase(prisma as never);

    await expect(
      usecase.execute('int-1', { status: 'SCHEDULED' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('creates participants with default scheduled attendance', async () => {
    const now = new Date('2026-03-10T10:00:00.000Z');
    const tx = {
      interviewSession: {
        create: jest.fn().mockResolvedValue({
          id: 'session-1',
          jobId: 'job-1',
          type: 'TECHNICAL',
          round: 1,
          status: 'SCHEDULED',
          scheduledAt: now,
          durationMinutes: 60,
          location: null,
          meetingUrl: null,
          createdById: 'hr-1',
          createdAt: now,
          updatedAt: now,
          participants: [
            {
              id: 'participant-1',
              sessionId: 'session-1',
              applicantId: 'applicant-1',
              attendanceStatus: 'SCHEDULED',
              createdAt: now,
              applicant: {
                id: 'applicant-1',
                firstName: 'Abel',
                lastName: 'Tesfaye',
                email: 'abel@example.com',
                status: 'SHORTLISTED',
              },
            },
          ],
          interviewers: [
            {
              id: 'assignment-1',
              sessionId: 'session-1',
              interviewerId: 'user-1',
              role: 'Panelist',
              createdAt: now,
              interviewer: {
                id: 'user-1',
                firstName: 'Liya',
                lastName: 'Tekle',
                email: 'liya@example.com',
                status: 'ACTIVE',
              },
            },
          ],
          feedbacks: [],
        }),
      },
      applicant: {
        update: jest.fn().mockResolvedValue(undefined),
        count: jest.fn().mockResolvedValue(1),
      },
      interviewParticipant: {
        count: jest.fn().mockResolvedValue(1),
      },
      job: {
        update: jest.fn().mockResolvedValue(undefined),
      },
      offer: {
        count: jest.fn().mockResolvedValue(0),
      },
    };
    const prisma = {
      job: {
        findUniqueOrThrow: jest.fn().mockResolvedValue({ id: 'job-1' }),
      },
      applicant: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'applicant-1',
            jobId: 'job-1',
          },
        ]),
      },
      interviewParticipant: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
      user: {
        findMany: jest.fn().mockResolvedValue([{ id: 'user-1' }]),
      },
      $transaction: jest.fn().mockImplementation((callback) => callback(tx)),
    };

    const usecase = new CreateInterviewUseCase(prisma as never);

    const result = await usecase.execute(
      {
        jobId: 'job-1',
        type: 'TECHNICAL',
        round: 1,
        scheduledAt: now.toISOString(),
        durationMinutes: 60,
        applicantIds: ['applicant-1'],
        interviewers: [{ interviewerId: 'user-1', role: 'Panelist' }],
      },
      'hr-1',
    );

    expect(result.participants[0]?.attendanceStatus).toBe('SCHEDULED');
    expect(tx.interviewSession.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          participants: {
            create: [
              expect.objectContaining({ attendanceStatus: 'SCHEDULED' }),
            ],
          },
        }),
      }),
    );
  });

  it('blocks duplicate active applicant-round entries', async () => {
    const prisma = {
      job: {
        findUniqueOrThrow: jest.fn().mockResolvedValue({ id: 'job-1' }),
      },
      applicant: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'applicant-1',
            jobId: 'job-1',
          },
        ]),
      },
      interviewParticipant: {
        findFirst: jest.fn().mockResolvedValue({ id: 'existing-participant' }),
      },
      user: {
        findMany: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const usecase = new CreateInterviewUseCase(prisma as never);

    await expect(
      usecase.execute(
        {
          jobId: 'job-1',
          type: 'TECHNICAL',
          round: 1,
          scheduledAt: '2026-03-10T10:00:00.000Z',
          applicantIds: ['applicant-1'],
          interviewers: [{ interviewerId: 'user-1' }],
        },
        'hr-1',
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects invalid participant attendance transitions', async () => {
    const prisma = {
      interviewParticipant: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'participant-1',
          sessionId: 'session-1',
          applicantId: 'applicant-1',
          attendanceStatus: 'COMPLETED',
          session: { id: 'session-1', jobId: 'job-1' },
        }),
      },
    };
    const usecase = new UpdateInterviewParticipantAttendanceUseCase(
      prisma as never,
    );

    await expect(
      usecase.execute('session-1', 'participant-1', {
        attendanceStatus: 'ATTENDING',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('allows valid participant attendance transitions', async () => {
    const now = new Date('2026-03-10T11:00:00.000Z');
    const tx = {
      interviewParticipant: {
        update: jest.fn().mockResolvedValue(undefined),
        count: jest.fn().mockResolvedValue(1),
      },
      applicant: {
        update: jest.fn().mockResolvedValue(undefined),
        count: jest.fn().mockResolvedValue(1),
      },
      job: {
        update: jest.fn().mockResolvedValue(undefined),
      },
      offer: {
        count: jest.fn().mockResolvedValue(0),
      },
      interviewSession: {
        findUniqueOrThrow: jest.fn().mockResolvedValue({
          id: 'session-1',
          jobId: 'job-1',
          type: 'TECHNICAL',
          round: 1,
          status: 'SCHEDULED',
          scheduledAt: now,
          durationMinutes: 60,
          location: null,
          meetingUrl: null,
          createdById: 'hr-1',
          createdAt: now,
          updatedAt: now,
          participants: [
            {
              id: 'participant-1',
              sessionId: 'session-1',
              applicantId: 'applicant-1',
              attendanceStatus: 'ATTENDING',
              createdAt: now,
              applicant: {
                id: 'applicant-1',
                firstName: 'Abel',
                lastName: 'Tesfaye',
                email: 'abel@example.com',
                status: 'INTERVIEW',
              },
            },
          ],
          interviewers: [],
          feedbacks: [],
        }),
      },
    };
    const prisma = {
      interviewParticipant: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'participant-1',
          sessionId: 'session-1',
          applicantId: 'applicant-1',
          attendanceStatus: 'SCHEDULED',
          session: { id: 'session-1', jobId: 'job-1' },
        }),
      },
      $transaction: jest.fn().mockImplementation((callback) => callback(tx)),
    };
    const usecase = new UpdateInterviewParticipantAttendanceUseCase(
      prisma as never,
    );

    const result = await usecase.execute('session-1', 'participant-1', {
      attendanceStatus: 'ATTENDING',
    });

    expect(result.participants[0]?.attendanceStatus).toBe('ATTENDING');
    expect(tx.interviewParticipant.update).toHaveBeenCalledWith({
      where: { id: 'participant-1' },
      data: { attendanceStatus: 'ATTENDING' },
    });
  });

  it('blocks feedback from non-assigned interviewer', async () => {
    const prisma = {
      interviewParticipant: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'participant-1',
          applicantId: 'applicant-1',
        }),
      },
      interviewerAssignment: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
    };
    const usecase = new UpsertInterviewFeedbackUseCase(prisma as never);

    await expect(
      usecase.execute('session-1', 'participant-1', 'user-1', {
        score: 78,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
