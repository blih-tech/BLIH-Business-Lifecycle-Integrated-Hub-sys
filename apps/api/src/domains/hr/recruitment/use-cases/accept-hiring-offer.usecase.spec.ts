import { AcceptHiringOfferUseCase } from './accept-hiring-offer.usecase';

describe('AcceptHiringOfferUseCase', () => {
  it('moves the candidate into onboarding and lifecycle in one transaction', async () => {
    const tx = {
      onboarding: {
        findUnique: jest.fn(),
        create: jest.fn().mockResolvedValue({ id: 'onboarding-1' }),
        update: jest.fn(),
      },
      userLifecycle: {
        upsert: jest.fn().mockResolvedValue({ id: 'lifecycle-1' }),
      },
      candidate: {
        update: jest.fn().mockResolvedValue({ id: 'candidate-1' }),
      },
      jobPosting: {
        update: jest.fn().mockResolvedValue({ id: 'posting-1' }),
      },
      recruitmentRequest: {
        update: jest.fn().mockResolvedValue({ id: 'request-1' }),
      },
      hiringDecision: {
        update: jest.fn().mockResolvedValue({
          id: 'decision-1',
          decisionId: 'DEC-2026-001',
          candidateId: 'candidate-1',
          recruitmentRequestId: 'request-1',
          jobPostingId: 'posting-1',
          candidateSummary: null,
          offer: { salary: 2000 },
          selectionReasoning: null,
          keyAssets: null,
          attachments: null,
          submittedById: 'user-1',
          submittedBy: { email: 'hr@example.com' },
          submittedAt: new Date('2026-03-01T00:00:00.000Z'),
          approvals: [],
          finalDecision: 'OFFER_APPROVED',
          offerDocumentUrl: null,
          candidateNotifiedAt: null,
          offerAccepted: true,
          acceptedAt: new Date('2026-03-02T00:00:00.000Z'),
          offerExpiresAt: null,
          employeeId: 'employee-1',
          onboardingId: 'onboarding-1',
          onboarding: { status: 'IN_PROGRESS' },
          createdAt: new Date('2026-03-01T00:00:00.000Z'),
          updatedAt: new Date('2026-03-02T00:00:00.000Z'),
        }),
      },
    };

    const prisma = {
      hiringDecision: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'decision-1',
          candidateId: 'candidate-1',
          recruitmentRequestId: 'request-1',
          jobPostingId: 'posting-1',
          finalDecision: 'OFFER_APPROVED',
          employeeId: null,
          onboardingId: null,
          submittedBy: { email: 'hr@example.com' },
          onboarding: null,
        }),
        findFirst: jest.fn().mockResolvedValue(null),
      },
      user: {
        findUnique: jest.fn().mockResolvedValue({ id: 'employee-1' }),
      },
      $transaction: jest.fn().mockImplementation((callback) => callback(tx)),
    };

    const useCase = new AcceptHiringOfferUseCase(prisma as never);

    await expect(
      useCase.execute('decision-1', {
        accepted: true,
        employeeId: 'employee-1',
        acceptedAt: '2026-03-02T00:00:00.000Z',
      }),
    ).resolves.toMatchObject({
      decisionId: 'DEC-2026-001',
      offerAccepted: true,
      onboardingStatus: 'IN_PROGRESS',
      employeeId: 'employee-1',
    });

    expect(tx.candidate.update).toHaveBeenCalledWith({
      where: { id: 'candidate-1' },
      data: { status: 'HIRED' },
    });
    expect(tx.userLifecycle.upsert).toHaveBeenCalledWith({
      where: { userId: 'employee-1' },
      update: { status: 'ONBOARDING' },
      create: { userId: 'employee-1', status: 'ONBOARDING' },
    });
    expect(tx.onboarding.create).toHaveBeenCalledWith({
      data: {
        userId: 'employee-1',
        status: 'IN_PROGRESS',
        startedAt: new Date('2026-03-02T00:00:00.000Z'),
      },
      select: { id: true },
    });
    expect(tx.recruitmentRequest.update).toHaveBeenCalledWith({
      where: { id: 'request-1' },
      data: {
        status: 'COMPLETED',
        linkedUserId: 'employee-1',
      },
    });
  });
});
