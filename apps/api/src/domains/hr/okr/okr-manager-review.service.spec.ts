import { BadRequestException } from '@nestjs/common';
import { OkrManagerReviewService } from './okr-manager-review.service';

describe('OkrManagerReviewService', () => {
  it('blocks manager reviews from non-managers on user OKRs', async () => {
    const prisma = {
      okr: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'okr-1',
          scope: 'USER',
          employeeId: 'employee-1',
          employee: {
            employment: {
              managerEmployment: {
                employee: {
                  userId: 'manager-1',
                },
              },
            },
          },
        }),
      },
      user: {
        findUniqueOrThrow: jest.fn().mockResolvedValue({ id: 'reviewer-2' }),
      },
      okrManagerReview: {
        upsert: jest.fn(),
      },
    };

    const service = new OkrManagerReviewService(prisma as never);

    await expect(
      service.upsert('okr-1', {
        reviewerId: 'reviewer-2',
        decision: 'APPROVED',
      }),
    ).rejects.toThrow(BadRequestException);
    expect(prisma.okrManagerReview.upsert).not.toHaveBeenCalled();
  });
});
