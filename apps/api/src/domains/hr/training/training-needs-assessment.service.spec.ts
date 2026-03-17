import { BadRequestException } from '@nestjs/common';
import { TrainingNeedsAssessmentService } from './training-needs-assessment.service';

describe('TrainingNeedsAssessmentService', () => {
  it('requires a rejection reason when rejecting an assessment', async () => {
    const prisma = {
      trainingNeedsAssessment: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'assessment-1',
          status: 'PENDING',
        }),
        update: jest.fn(),
      },
      user: {
        findUniqueOrThrow: jest.fn().mockResolvedValue({ id: 'manager-1' }),
      },
    };

    const service = new TrainingNeedsAssessmentService(prisma as never);

    await expect(
      service.review('assessment-1', {
        approved: false,
        reviewedById: 'manager-1',
      }),
    ).rejects.toThrow(BadRequestException);
    expect(prisma.trainingNeedsAssessment.update).not.toHaveBeenCalled();
  });
});
