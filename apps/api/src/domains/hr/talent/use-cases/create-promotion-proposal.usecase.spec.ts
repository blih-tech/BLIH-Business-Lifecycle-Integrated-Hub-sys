import { BadRequestException } from '@nestjs/common';
import { CreatePromotionProposalUseCase } from './create-promotion-proposal.usecase';

describe('CreatePromotionProposalUseCase', () => {
  it('requires a promotion-eligible performance review', async () => {
    const prisma = {
      user: {
        findUniqueOrThrow: jest.fn().mockResolvedValue({ id: 'user-1' }),
      },
      position: {
        findUniqueOrThrow: jest.fn().mockResolvedValue({ id: 'position-2' }),
      },
      userEmployment: {
        findUnique: jest.fn().mockResolvedValue({
          positionId: 'position-1',
        }),
      },
      performanceReview: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'review-1',
          promotionEligible: false,
        }),
      },
    };

    const useCase = new CreatePromotionProposalUseCase(prisma as never);

    await expect(
      useCase.execute({
        userId: 'user-1',
        toPositionId: 'position-2',
        proposedById: 'manager-1',
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
