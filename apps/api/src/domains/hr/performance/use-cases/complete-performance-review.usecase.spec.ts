import { BadRequestException } from '@nestjs/common';
import { CompletePerformanceReviewUseCase } from './complete-performance-review.usecase';

describe('CompletePerformanceReviewUseCase', () => {
  it('computes a weighted final rating using 360 feedback inputs', async () => {
    const prisma = {
      performanceReview: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'review-1',
          status: 'MANAGER_SUBMITTED',
          selfAssessment: {
            goalRatings: [{ selfRating: 4 }],
          },
          managerReview: {
            overallRating: 5,
          },
          feedbackEntries: [
            { role: 'PEER', ratings: { collaboration: 4 } },
            { role: 'DIRECT_REPORT', ratings: { coaching: 3 } },
            { role: 'SKIP_LEVEL', ratings: { leadership: 5 } },
          ],
        }),
        update: jest.fn().mockResolvedValue({
          id: 'review-1',
          userId: 'user-1',
          periodConfigId: 'period-1',
          selfAssessment: {},
          managerReview: {},
          finalRating: { toNumber: () => 4.5 },
          category: 'OUTSTANDING',
          raiseRecommendation: { minPercent: 10, maxPercent: 15 },
          promotionEligible: true,
          completedAt: new Date('2026-03-02T10:00:00.000Z'),
          status: 'COMPLETED',
          createdAt: new Date('2026-03-01T10:00:00.000Z'),
          updatedAt: new Date('2026-03-02T10:00:00.000Z'),
          feedbackEntries: [],
        }),
      },
    };

    const useCase = new CompletePerformanceReviewUseCase(prisma as never);

    const result = await useCase.execute('review-1');

    expect(prisma.performanceReview.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          finalRating: 4.5,
          category: 'OUTSTANDING',
          promotionEligible: true,
        }),
      }),
    );
    expect(result.finalRating).toBe(4.5);
    expect(result.category).toBe('OUTSTANDING');
  });

  it('rejects completion when self or manager ratings are missing', async () => {
    const prisma = {
      performanceReview: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'review-1',
          status: 'MANAGER_SUBMITTED',
          selfAssessment: null,
          managerReview: { overallRating: 4 },
          feedbackEntries: [],
        }),
      },
    };

    const useCase = new CompletePerformanceReviewUseCase(prisma as never);

    await expect(useCase.execute('review-1')).rejects.toThrow(
      BadRequestException,
    );
  });
});
