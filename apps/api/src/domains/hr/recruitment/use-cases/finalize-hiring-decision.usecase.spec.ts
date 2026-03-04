import { ConflictException } from '@nestjs/common';
import { FinalizeHiringDecisionUseCase } from './finalize-hiring-decision.usecase';

describe('FinalizeHiringDecisionUseCase', () => {
  it('prevents multiple approved hires for the same recruitment request', async () => {
    const prisma = {
      hiringDecision: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'decision-1',
          candidateId: 'candidate-1',
          recruitmentRequestId: 'request-1',
          jobPostingId: 'posting-1',
          offer: { totalPay: 1000, currency: 'USD' },
          submittedById: 'user-1',
          submittedBy: { email: 'hr@example.com' },
          onboarding: null,
        }),
        findFirst: jest.fn().mockResolvedValue({ id: 'decision-2' }),
      },
      recruitmentRequest: {
        findUnique: jest.fn().mockResolvedValue({
          departmentId: 'dept-1',
          staffing: {
            salaryBracket: { min: 800, max: 1500, currency: 'USD' },
          },
          position: {
            id: 'position-1',
            grade: {
              minSalary: 800,
              maxSalary: 1500,
            },
          },
        }),
      },
      jobPosting: {
        findUnique: jest.fn().mockResolvedValue({
          positionId: 'position-1',
        }),
      },
      cvScreening: {
        findFirst: jest.fn().mockResolvedValue({
          aggregateRating: 92,
        }),
      },
      interviewFeedback: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      userCompensation: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    };

    const useCase = new FinalizeHiringDecisionUseCase(prisma as never);

    await expect(
      useCase.execute('decision-1', {
        finalDecision: 'OFFER_APPROVED',
        offer: { totalPay: 1000, currency: 'USD' },
      }),
    ).rejects.toThrow(ConflictException);
  });
});
