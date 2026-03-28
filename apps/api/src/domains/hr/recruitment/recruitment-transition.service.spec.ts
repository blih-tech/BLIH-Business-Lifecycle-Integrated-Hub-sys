import { RecruitmentTransitionService } from './recruitment-transition.service';

const fixedNow = new Date('2026-03-12T09:00:00.000Z');

const buildAcceptedOfferSnapshot = () => ({
  id: 'offer-1',
  status: 'ACCEPTED',
  jobId: 'job-1',
  applicantId: 'app-1',
  onboardingId: null,
  salary: 145000,
  currency: 'USD',
  startDate: new Date('2026-04-01T00:00:00.000Z'),
  payFrequency: 'MONTHLY',
  employmentType: 'FULL_TIME',
  bonus: 5000,
  equity: 0,
});

const buildApplicantSnapshot = () => ({
  id: 'app-1',
  status: 'OFFER',
  firstName: 'Abel',
  lastName: 'Tesfaye',
  email: 'abel@example.com',
  phone: '+251900000001',
  linkedinUrl: 'https://linkedin.com/in/abel',
  portfolioUrl: null,
  githubUrl: 'https://github.com/abel',
  skills: ['typescript', 'nestjs'],
  yearsExperience: 6,
  currentCompany: 'TechCorp',
  currentPosition: 'Senior Engineer',
  educationLevel: 'BACHELORS',
  highestDegree: 'BSc',
  location: 'Addis Ababa',
  nationality: 'Ethiopian',
  source: 'COMPANY_SITE',
  referredById: null,
  sourceSnapshot: { campaign: 'spring-2026' },
  customFieldValues: { visaRequired: false },
  coverLetter: 'Happy to join.',
  educations: [],
  experiences: [],
  jobId: 'job-1',
  offers: [buildAcceptedOfferSnapshot()],
  job: {
    id: 'job-1',
    title: 'Senior Backend Engineer',
    positionId: 'pos-1',
    employmentType: 'FULL_TIME',
    hiringManagerId: 'manager-user-1',
  },
});

describe('RecruitmentTransitionService', () => {
  it('hires applicants with accepted offers into user, employment, compensation records without onboarding lists', async () => {
    jest.useFakeTimers().setSystemTime(fixedNow);

    const tx = {
      applicant: {
        update: jest.fn().mockResolvedValue(undefined),
        count: jest.fn().mockResolvedValue(1),
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
      offer: {
        count: jest.fn().mockResolvedValue(0),
      },
    };

    const prisma = {
      applicant: {
        findUnique: jest.fn().mockResolvedValue(buildApplicantSnapshot()),
      },
      userEmployment: {
        findFirst: jest.fn().mockResolvedValue({ id: 'mgr-employment-1' }),
      },
      $transaction: jest.fn().mockImplementation((callback) => callback(tx)),
    };

    const provisioning = {
      generateUniqueUsername: jest.fn().mockResolvedValue('abel.tesfaye'),
      assertLocalIdentityAvailable: jest.fn().mockResolvedValue(undefined),
      createExternalUser: jest.fn().mockResolvedValue('kc-user-1'),
      createLocalUserGraph: jest.fn().mockResolvedValue({
        user: { id: 'user-1' },
        employee: { id: 'user-1' },
      }),
      sendRequiredActionsEmail: jest.fn().mockResolvedValue(undefined),
      cleanupExternalUser: jest.fn().mockResolvedValue(undefined),
      rethrowPersistenceError: jest.fn((error: unknown) => {
        throw error;
      }),
    };

    const notifications = {
      execute: jest.fn().mockResolvedValue(undefined),
    };

    const service = new RecruitmentTransitionService(
      prisma as never,
      provisioning as never,
      notifications as never,
    );

    const result = await service.hireApplicant(
      'app-1',
      {
        companyEmail: 'abel.tesfaye@blih.com',
        isCompanyEmailPrimary: true,
      },
      'hr-1',
    );

    expect(provisioning.createLocalUserGraph).toHaveBeenCalledWith(
      tx,
      expect.objectContaining({
        username: 'abel.tesfaye',
        email: 'abel.tesfaye@blih.com',
        lifecycleStatus: 'ONBOARDING',
        employment: expect.objectContaining({
          positionId: 'pos-1',
          employmentType: 'FULL_TIME',
          managerEmploymentId: 'mgr-employment-1',
          changedById: 'hr-1',
        }),
        compensation: expect.objectContaining({
          baseSalary: 145000,
          currency: 'USD',
          payFrequency: 'MONTHLY',
          bonusEligible: true,
          changedById: 'hr-1',
        }),
      }),
    );
    expect(tx.applicantStatusHistory.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          applicantId: 'app-1',
          toStatus: 'HIRED',
          changedById: 'hr-1',
        }),
      }),
    );
    expect(tx.applicant.update).toHaveBeenCalledWith({
      where: { id: 'app-1' },
      data: {
        employee: {
          connect: { id: 'user-1' },
        },
      },
    });
    expect(provisioning.sendRequiredActionsEmail).toHaveBeenCalledWith({
      keycloakId: 'kc-user-1',
      actions: ['UPDATE_PASSWORD'],
      lifespanSeconds: 604800,
    });
    expect(notifications.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        recipients: ['abel.tesfaye@blih.com'],
        channels: ['email', 'in_app'],
        payload: expect.objectContaining({
          employeeId: 'user-1',
          jobId: 'job-1',
          applicantId: 'app-1',
        }),
      }),
    );
    expect(result.employeeId).toBe('user-1');
    expect(result.userId).toBe('user-1');

    jest.useRealTimers();
  });

  it('cleans up the external user when local provisioning fails', async () => {
    const tx = {
      applicant: {
        update: jest.fn().mockRejectedValue(new Error('database failure')),
      },
      offer: {
        count: jest.fn().mockResolvedValue(0),
      },
    };

    const prisma = {
      applicant: {
        findUnique: jest.fn().mockResolvedValue(buildApplicantSnapshot()),
      },
      userEmployment: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
      $transaction: jest.fn().mockImplementation((callback) => callback(tx)),
    };

    const provisioning = {
      generateUniqueUsername: jest.fn().mockResolvedValue('abel.tesfaye'),
      assertLocalIdentityAvailable: jest.fn().mockResolvedValue(undefined),
      createExternalUser: jest.fn().mockResolvedValue('kc-user-1'),
      createLocalUserGraph: jest.fn().mockResolvedValue({
        user: { id: 'user-1' },
        employee: { id: 'user-1' },
      }),
      sendRequiredActionsEmail: jest.fn(),
      cleanupExternalUser: jest.fn().mockResolvedValue(undefined),
      rethrowPersistenceError: jest.fn((error: unknown) => {
        throw error;
      }),
    };

    const notifications = {
      execute: jest.fn(),
    };

    const service = new RecruitmentTransitionService(
      prisma as never,
      provisioning as never,
      notifications as never,
    );

    await expect(
      service.hireApplicant(
        'app-1',
        {
          companyEmail: 'abel.tesfaye@blih.com',
          isCompanyEmailPrimary: true,
        },
        'hr-1',
      ),
    ).rejects.toThrow('database failure');
    expect(provisioning.cleanupExternalUser).toHaveBeenCalledWith('kc-user-1');
  });
});
