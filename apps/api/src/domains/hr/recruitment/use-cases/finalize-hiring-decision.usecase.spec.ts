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
