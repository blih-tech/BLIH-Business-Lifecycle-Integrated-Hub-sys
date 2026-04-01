import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { SYSTEM_ROLES } from '../../../../shared/constants/system-roles.constant';
import { ApproveJobUseCase, SubmitJobUseCase } from './jobs.usecases';
import {
  BulkUpdateApplicantStatusUseCase,
  CreateApplicantUseCase,
  ListApplicantsUseCase,
  UpdateApplicantStatusUseCase,
} from './applicants.usecases';
import {
  CreateInterviewQuestionUseCase,
  DeactivateInterviewQuestionUseCase,
  ListInterviewQuestionsUseCase,
  UpdateInterviewQuestionUseCase,
} from './interview-questions.usecases';
import {
  CreateInterviewUseCase,
  UpdateInterviewParticipantAttendanceUseCase,
  UpdateInterviewUseCase,
  UpsertInterviewFeedbackUseCase,
} from './interviews.usecases';
import { SendOfferUseCase } from './offers.usecases';

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

const buildApplicantRow = (
  status: string,
  overrides: Record<string, unknown> = {},
) => ({
  id: 'app-1',
  jobId: 'job-1',
  applicationFormId: null,
  firstName: 'Abel',
  lastName: 'Tesfaye',
  email: 'abel@example.com',
  phone: '+251900000001',
  resumeUrl: 'https://cdn.example.com/cv/abel.pdf',
  linkedinUrl: 'https://linkedin.com/in/abel',
  portfolioUrl: null,
  githubUrl: 'https://github.com/abel',
  source: 'COMPANY_SITE',
  referredById: null,
  currentCompany: 'TechCorp',
  currentPosition: 'Engineer',
  yearsExperience: 6,
  location: 'Addis Ababa',
  nationality: 'Ethiopian',
  expectedSalary: 120000,
  currentSalary: 100000,
  educationLevel: 'BACHELORS',
  highestDegree: 'BSc',
  skills: ['typescript'],
  status,
  coverLetter: null,
  sourceSnapshot: null,
  customFieldValues: null,
  appliedAt: fixedNow,
  screeningAt: status !== 'APPLIED' ? fixedNow : null,
  shortlistedAt: status === 'SHORTLISTED' ? fixedNow : null,
  interviewAt: status === 'INTERVIEW' ? fixedNow : null,
  waitlistAt: status === 'WAITLIST' ? fixedNow : null,
  offerAt: status === 'OFFER' ? fixedNow : null,
  hiredAt: status === 'HIRED' ? fixedNow : null,
  rejectedAt: status === 'REJECTED' ? fixedNow : null,
  withdrawnAt: status === 'WITHDRAWN' ? fixedNow : null,
  lastActivityAt: fixedNow,
  profileScore: 80,
  educations: [],
  experiences: [],
  statusHistory: [],
  createdAt: fixedNow,
  updatedAt: fixedNow,
  ...overrides,
});

const buildOfferRow = (
  status: string,
  overrides: Record<string, unknown> = {},
) => ({
  id: 'offer-1',
  jobId: 'job-1',
  applicantId: 'app-1',
  createdById: 'hr-1',
  status,
  salary: 145000,
  currency: 'USD',
  startDate: new Date('2026-04-01T00:00:00.000Z'),
  payFrequency: 'MONTHLY',
  employmentType: 'FULL_TIME',
  bonus: 5000,
  equity: 0,
  offerLetterUrl: null,
  notes: null,
  sentAt: status === 'SENT' ? fixedNow : null,
  respondedAt: status === 'ACCEPTED' || status === 'DECLINED' ? fixedNow : null,
  expiresAt: null,
  onboardingId: null,
  employeeId: null,
  userId: null,
  createdAt: fixedNow,
  updatedAt: fixedNow,
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

    expect(result.requestForm?.status.workflow).toBe('PENDING_FOR_APPROVAL');
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
    expect(result.requestForm?.status.workflow).toBe('PENDING_FOR_APPROVAL');
    expect(result.requestForm?.status.approvals.hr).toBe('APPROVED');
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
    expect(result.requestForm?.status.workflow).toBe('PENDING_FOR_APPROVAL');
    expect(result.requestForm?.status.approvals.hr).toBe('APPROVED');
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

    expect(rejected.requestForm?.status.workflow).toBe('REJECTED');

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

  it('creates an applicant for a published job and refreshes metrics', async () => {
    const applicant = buildApplicantRow('APPLIED', {
      id: 'app-1',
      jobId: 'job-1',
      applicationFormId: 'form-1',
      email: 'abel.tesfaye@example.com',
    });
    const tx = {
      applicant: {
        create: jest.fn().mockResolvedValue(applicant),
        update: jest.fn().mockResolvedValue(undefined),
        count: jest
          .fn()
          .mockResolvedValueOnce(1)
          .mockResolvedValueOnce(0)
          .mockResolvedValueOnce(0),
      },
      offer: {
        count: jest.fn().mockResolvedValue(0),
      },
      interviewParticipant: {
        count: jest.fn().mockResolvedValue(0),
      },
      job: {
        update: jest.fn().mockResolvedValue(undefined),
      },
    };
    const prisma = {
      job: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'job-1',
          title: 'Senior Backend Engineer',
          createdById: 'creator-1',
          requestForm: {
            status: 'PUBLISHED',
          },
          applicationForm: {
            id: 'form-1',
            applicantFields: [],
            sections: [],
            customFields: [],
          },
        }),
      },
      user: {
        findUnique: jest.fn(),
      },
      $transaction: jest
        .fn()
        .mockImplementation(async (callback) => callback(tx)),
    };
    const notifications = {
      notifyUsers: jest.fn().mockResolvedValue(undefined),
    };
    const usecase = new CreateApplicantUseCase(
      prisma as never,
      notifications as never,
    );

    const result = await usecase.execute({
      jobId: 'job-1',
      firstName: 'Abel',
      lastName: 'Tesfaye',
      email: 'abel.tesfaye@example.com',
      phone: '+251912345678',
      resumeUrl: 'https://cdn.example.com/cv/abel.pdf',
      skills: ['TypeScript', 'Node.js'],
    });

    expect(tx.applicant.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          jobId: 'job-1',
          applicationFormId: 'form-1',
          email: 'abel.tesfaye@example.com',
          emailNormalized: 'abel.tesfaye@example.com',
        }),
      }),
    );
    expect(tx.job.update).toHaveBeenCalledWith({
      where: { id: 'job-1' },
      data: {
        applicationsCount: 1,
        shortlistedCount: 0,
        offersCount: 0,
        hiresCount: 0,
        interviewsCount: 0,
      },
    });
    expect(notifications.notifyUsers).toHaveBeenCalledWith(
      expect.objectContaining({
        userIds: ['creator-1'],
        payload: {
          jobId: 'job-1',
          applicantId: 'app-1',
        },
      }),
    );
    expect(result.id).toBe('app-1');
  });

  it('rejects applications for jobs that are not published', async () => {
    const prisma = {
      job: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'job-1',
          title: 'Senior Backend Engineer',
          createdById: 'creator-1',
          requestForm: {
            status: 'DRAFT',
          },
          applicationForm: null,
        }),
      },
      user: {
        findUnique: jest.fn(),
      },
      $transaction: jest.fn(),
    };
    const notifications = {
      notifyUsers: jest.fn(),
    };
    const usecase = new CreateApplicantUseCase(
      prisma as never,
      notifications as never,
    );

    await expect(
      usecase.execute({
        jobId: 'job-1',
        firstName: 'Abel',
        lastName: 'Tesfaye',
        email: 'abel.tesfaye@example.com',
        resumeUrl: 'https://cdn.example.com/cv/abel.pdf',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('rejects applications that miss required application form fields', async () => {
    const prisma = {
      job: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'job-1',
          title: 'Senior Backend Engineer',
          createdById: 'creator-1',
          requestForm: {
            status: 'PUBLISHED',
          },
          applicationForm: {
            id: 'form-1',
            applicantFields: [
              {
                key: 'PHONE',
                enabled: true,
                required: true,
              },
            ],
            sections: [],
            customFields: [],
          },
        }),
      },
      user: {
        findUnique: jest.fn(),
      },
      $transaction: jest.fn(),
    };
    const notifications = {
      notifyUsers: jest.fn(),
    };
    const usecase = new CreateApplicantUseCase(
      prisma as never,
      notifications as never,
    );

    await expect(
      usecase.execute({
        jobId: 'job-1',
        firstName: 'Abel',
        lastName: 'Tesfaye',
        email: 'abel.tesfaye@example.com',
        resumeUrl: 'https://cdn.example.com/cv/abel.pdf',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('maps duplicate applicant inserts to a conflict error', async () => {
    const prisma = {
      job: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'job-1',
          title: 'Senior Backend Engineer',
          createdById: 'creator-1',
          requestForm: {
            status: 'PUBLISHED',
          },
          applicationForm: null,
        }),
      },
      user: {
        findUnique: jest.fn(),
      },
      $transaction: jest.fn().mockRejectedValue({ code: 'P2002' }),
    };
    const notifications = {
      notifyUsers: jest.fn(),
    };
    const usecase = new CreateApplicantUseCase(
      prisma as never,
      notifications as never,
    );

    await expect(
      usecase.execute({
        jobId: 'job-1',
        firstName: 'Abel',
        lastName: 'Tesfaye',
        email: 'abel.tesfaye@example.com',
        resumeUrl: 'https://cdn.example.com/cv/abel.pdf',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('adds free-text applicant search filters without breaking existing filters', async () => {
    const prisma = {
      applicant: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    };
    const usecase = new ListApplicantsUseCase(prisma as never);

    await usecase.execute({
      status: 'SCREENING',
      jobId: 'job-1',
      search: 'abel techcorp',
    });

    expect(prisma.applicant.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: 'SCREENING',
          jobId: 'job-1',
          AND: [
            {
              OR: expect.arrayContaining([
                {
                  firstName: { contains: 'abel', mode: 'insensitive' },
                },
                {
                  currentCompany: {
                    contains: 'abel',
                    mode: 'insensitive',
                  },
                },
              ]),
            },
            {
              OR: expect.arrayContaining([
                {
                  firstName: { contains: 'techcorp', mode: 'insensitive' },
                },
                {
                  currentCompany: {
                    contains: 'techcorp',
                    mode: 'insensitive',
                  },
                },
              ]),
            },
          ],
        }),
      }),
    );
  });

  it('bulk shortlists applicants atomically and records status history', async () => {
    const tx = {
      applicant: {
        update: jest.fn().mockResolvedValue(undefined),
        findMany: jest
          .fn()
          .mockResolvedValue([
            buildApplicantRow('SHORTLISTED', { id: 'app-1' }),
            buildApplicantRow('SHORTLISTED', { id: 'app-2' }),
          ]),
        count: jest
          .fn()
          .mockResolvedValueOnce(2)
          .mockResolvedValueOnce(2)
          .mockResolvedValueOnce(0),
      },
      applicantStatusHistory: {
        create: jest.fn().mockResolvedValue(undefined),
      },
      offer: {
        count: jest.fn().mockResolvedValue(0),
      },
      interviewParticipant: {
        count: jest.fn().mockResolvedValue(0),
      },
      job: {
        update: jest.fn().mockResolvedValue(undefined),
      },
    };
    const prisma = {
      applicant: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'app-1',
            status: 'SCREENING',
            jobId: 'job-1',
          },
          {
            id: 'app-2',
            status: 'SCREENING',
            jobId: 'job-1',
          },
        ]),
      },
      $transaction: jest.fn().mockImplementation((callback) => callback(tx)),
    };

    const usecase = new BulkUpdateApplicantStatusUseCase(prisma as never);
    const result = await usecase.execute(
      {
        applicantIds: ['app-1', 'app-2'],
        status: 'SHORTLISTED',
        notes: 'Passed HR review',
      },
      'hr-1',
    );

    expect(tx.applicant.update).toHaveBeenCalledTimes(2);
    expect(tx.applicantStatusHistory.create).toHaveBeenCalledTimes(2);
    expect(tx.job.update).toHaveBeenCalledTimes(1);
    expect(result.status).toBe('SHORTLISTED');
    expect(result.updatedCount).toBe(2);
    expect(result.applicants.map((applicant) => applicant.id)).toEqual([
      'app-1',
      'app-2',
    ]);
  });

  it('rejects invalid bulk applicant transitions before starting the transaction', async () => {
    const prisma = {
      applicant: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'app-1',
            status: 'APPLIED',
            jobId: 'job-1',
          },
        ]),
      },
      $transaction: jest.fn(),
    };

    const usecase = new BulkUpdateApplicantStatusUseCase(prisma as never);

    await expect(
      usecase.execute({
        applicantIds: ['app-1'],
        status: 'SHORTLISTED',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('rejects invalid applicant status transitions', async () => {
    const tx = {
      applicant: {
        update: jest.fn(),
        findUniqueOrThrow: jest.fn(),
      },
      applicantStatusHistory: {
        create: jest.fn(),
      },
      offer: {
        count: jest.fn(),
      },
      interviewParticipant: {
        count: jest.fn(),
      },
      job: {
        update: jest.fn(),
      },
    };
    const prisma = {
      applicant: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'app-1',
          status: 'APPLIED',
          jobId: 'job-1',
        }),
        update: jest.fn(),
      },
      $transaction: jest.fn().mockImplementation((callback) => callback(tx)),
    };
    const usecase = new UpdateApplicantStatusUseCase(prisma as never);

    await expect(
      usecase.execute('app-1', { status: 'HIRED' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('sends an offer only from an interviewable applicant state and records history', async () => {
    const tx = {
      offer: {
        update: jest.fn().mockResolvedValue(undefined),
        findUniqueOrThrow: jest.fn().mockResolvedValue(buildOfferRow('SENT')),
        count: jest.fn().mockResolvedValue(1),
      },
      applicant: {
        update: jest.fn().mockResolvedValue(undefined),
        count: jest.fn().mockResolvedValueOnce(1).mockResolvedValueOnce(0),
      },
      applicantStatusHistory: {
        create: jest.fn().mockResolvedValue(undefined),
      },
      interviewParticipant: {
        count: jest.fn().mockResolvedValue(1),
      },
      job: {
        update: jest.fn().mockResolvedValue(undefined),
      },
      onboarding: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    };
    const prisma = {
      offer: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'offer-1',
          status: 'DRAFT',
          jobId: 'job-1',
          applicantId: 'app-1',
          applicant: {
            status: 'INTERVIEW',
          },
        }),
      },
      onboarding: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      $transaction: jest.fn().mockImplementation((callback) => callback(tx)),
    };

    const usecase = new SendOfferUseCase(prisma as never);
    const result = await usecase.execute('offer-1', {}, 'hr-1');

    expect(tx.offer.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'offer-1' },
        data: expect.objectContaining({ status: 'SENT' }),
      }),
    );
    expect(tx.applicantStatusHistory.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          applicantId: 'app-1',
          toStatus: 'OFFER',
          changedById: 'hr-1',
        }),
      }),
    );
    expect(result.status).toBe('SENT');
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

  it('creates a reusable interview question', async () => {
    const now = new Date('2026-03-11T08:00:00.000Z');
    const prisma = {
      interviewQuestion: {
        create: jest.fn().mockResolvedValue({
          id: 'question-1',
          question: 'Explain REST API principles',
          description: null,
          category: 'TECHNICAL',
          type: 'TEXT',
          options: [],
          difficulty: 3,
          tags: ['rest', 'api'],
          createdById: 'user-1',
          isActive: true,
          createdAt: now,
          updatedAt: now,
        }),
      },
    };
    const usecase = new CreateInterviewQuestionUseCase(prisma as never);

    const result = await usecase.execute(
      {
        question: '  Explain REST API principles  ',
        category: 'TECHNICAL',
        type: 'TEXT',
        difficulty: 3,
        tags: ['REST', 'api', 'api'],
      },
      'user-1',
    );

    expect(result.question).toBe('Explain REST API principles');
    expect(prisma.interviewQuestion.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tags: ['rest', 'api'],
          options: [],
        }),
      }),
    );
  });

  it('rejects select question creation without options', async () => {
    const prisma = {
      interviewQuestion: {
        create: jest.fn(),
      },
    };
    const usecase = new CreateInterviewQuestionUseCase(prisma as never);

    await expect(
      usecase.execute(
        {
          question: 'Choose your primary stack',
          type: 'SINGLE_SELECT',
        },
        'user-1',
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('updates and deactivates interview questions', async () => {
    const now = new Date('2026-03-11T08:10:00.000Z');
    const prisma = {
      interviewQuestion: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'question-1',
          question: 'Old',
          description: null,
          category: 'TECHNICAL',
          type: 'TEXT',
          options: [],
          difficulty: 2,
          tags: ['legacy'],
          createdById: 'user-1',
          isActive: true,
          createdAt: now,
          updatedAt: now,
        }),
        update: jest
          .fn()
          .mockResolvedValueOnce({
            id: 'question-1',
            question: 'Updated question',
            description: null,
            category: 'TECHNICAL',
            type: 'TEXT',
            options: [],
            difficulty: 4,
            tags: ['api'],
            createdById: 'user-1',
            isActive: true,
            createdAt: now,
            updatedAt: now,
          })
          .mockResolvedValueOnce({
            id: 'question-1',
            question: 'Updated question',
            description: null,
            category: 'TECHNICAL',
            type: 'TEXT',
            options: [],
            difficulty: 4,
            tags: ['api'],
            createdById: 'user-1',
            isActive: false,
            createdAt: now,
            updatedAt: now,
          }),
      },
    };

    const updateUsecase = new UpdateInterviewQuestionUseCase(prisma as never);
    const deactivateUsecase = new DeactivateInterviewQuestionUseCase(
      prisma as never,
    );

    const updated = await updateUsecase.execute('question-1', {
      question: 'Updated question',
      difficulty: 4,
      tags: ['API'],
    });
    const deactivated = await deactivateUsecase.execute('question-1');

    expect(updated.tags).toEqual(['api']);
    expect(deactivated.isActive).toBe(false);
  });

  it('lists interview questions with default active filter', async () => {
    const now = new Date('2026-03-11T08:15:00.000Z');
    const prisma = {
      interviewQuestion: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'question-1',
            question: 'Explain REST API principles',
            description: null,
            category: 'TECHNICAL',
            type: 'TEXT',
            options: [],
            difficulty: 3,
            tags: ['rest', 'api'],
            createdById: 'user-1',
            isActive: true,
            createdAt: now,
            updatedAt: now,
          },
        ]),
      },
    };
    const usecase = new ListInterviewQuestionsUseCase(prisma as never);

    await usecase.execute({
      category: 'TECHNICAL',
      tags: 'rest,api',
      difficulty: 3,
    });

    expect(prisma.interviewQuestion.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          isActive: true,
          category: 'TECHNICAL',
          difficulty: 3,
          tags: { hasSome: ['rest', 'api'] },
        }),
      }),
    );
  });

  it('derives interview feedback score from question responses when score is omitted', async () => {
    const now = new Date('2026-03-11T08:20:00.000Z');
    const tx = {
      interviewFeedback: {
        upsert: jest.fn().mockResolvedValue({
          id: 'feedback-1',
          participantId: 'participant-1',
          assignmentId: 'assignment-1',
          score: 80,
          endorsement: 'YES',
          strengths: [],
          weaknesses: [],
          questionResponses: [
            {
              questionId: 'question-1',
              question: 'Explain REST API principles',
              category: 'TECHNICAL',
              type: 'TEXT',
              answer: 'Good answer',
              score: 4,
              maxScore: 5,
              weight: 1,
              notes: null,
            },
          ],
          notes: null,
          isDraft: false,
          submittedAt: now,
          createdAt: now,
          updatedAt: now,
          assignment: { interviewerId: 'user-1' },
        }),
      },
      applicant: {
        update: jest.fn().mockResolvedValue(undefined),
      },
    };

    const prisma = {
      interviewParticipant: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'participant-1',
          applicantId: 'applicant-1',
        }),
      },
      interviewerAssignment: {
        findUnique: jest.fn().mockResolvedValue({ id: 'assignment-1' }),
      },
      interviewQuestion: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'question-1',
            question: 'Explain REST API principles',
            category: 'TECHNICAL',
            type: 'TEXT',
          },
        ]),
      },
      $transaction: jest.fn().mockImplementation((callback) => callback(tx)),
    };
    const usecase = new UpsertInterviewFeedbackUseCase(prisma as never);

    const result = await usecase.execute(
      'session-1',
      'participant-1',
      'user-1',
      {
        endorsement: 'YES',
        questionResponses: [
          {
            questionId: 'question-1',
            question: 'ignored by bank snapshot',
            category: 'BEHAVIORAL',
            type: 'TEXT',
            answer: 'Good answer',
            score: 4,
            maxScore: 5,
            weight: 1,
          },
        ],
      },
    );

    expect(result.score).toBe(80);
    expect(tx.interviewFeedback.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          score: 80,
        }),
      }),
    );
  });

  it('preserves manual score over computed score when score is provided', async () => {
    const now = new Date('2026-03-11T08:25:00.000Z');
    const tx = {
      interviewFeedback: {
        upsert: jest.fn().mockResolvedValue({
          id: 'feedback-2',
          participantId: 'participant-1',
          assignmentId: 'assignment-1',
          score: 50,
          endorsement: null,
          strengths: [],
          weaknesses: [],
          questionResponses: [],
          notes: null,
          isDraft: true,
          submittedAt: null,
          createdAt: now,
          updatedAt: now,
          assignment: { interviewerId: 'user-1' },
        }),
      },
      applicant: {
        update: jest.fn().mockResolvedValue(undefined),
      },
    };
    const prisma = {
      interviewParticipant: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'participant-1',
          applicantId: 'applicant-1',
        }),
      },
      interviewerAssignment: {
        findUnique: jest.fn().mockResolvedValue({ id: 'assignment-1' }),
      },
      interviewQuestion: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      $transaction: jest.fn().mockImplementation((callback) => callback(tx)),
    };
    const usecase = new UpsertInterviewFeedbackUseCase(prisma as never);

    await usecase.execute('session-1', 'participant-1', 'user-1', {
      score: 50,
      isDraft: true,
      questionResponses: [],
    });

    expect(tx.interviewFeedback.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          score: 50,
        }),
      }),
    );
  });

  it('rejects unknown bank question ids and invalid answer shape', async () => {
    const basePrisma = {
      interviewParticipant: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'participant-1',
          applicantId: 'applicant-1',
        }),
      },
      interviewerAssignment: {
        findUnique: jest.fn().mockResolvedValue({ id: 'assignment-1' }),
      },
      $transaction: jest.fn(),
    };

    const unknownQuestionPrisma = {
      ...basePrisma,
      interviewQuestion: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    };
    const unknownQuestionUsecase = new UpsertInterviewFeedbackUseCase(
      unknownQuestionPrisma as never,
    );
    await expect(
      unknownQuestionUsecase.execute('session-1', 'participant-1', 'user-1', {
        questionResponses: [
          {
            questionId: 'question-unknown',
            question: 'ignored',
            type: 'TEXT',
            answer: 'answer',
          },
        ],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    const invalidAnswerPrisma = {
      ...basePrisma,
      interviewQuestion: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'question-1',
            question: 'Is CI configured?',
            category: 'TECHNICAL',
            type: 'BOOLEAN',
          },
        ]),
      },
    };
    const invalidAnswerUsecase = new UpsertInterviewFeedbackUseCase(
      invalidAnswerPrisma as never,
    );
    await expect(
      invalidAnswerUsecase.execute('session-1', 'participant-1', 'user-1', {
        questionResponses: [
          {
            questionId: 'question-1',
            question: 'ignored',
            type: 'BOOLEAN',
            answer: 'yes',
          },
        ],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
