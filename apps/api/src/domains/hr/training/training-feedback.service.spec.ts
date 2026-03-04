import { BadRequestException } from '@nestjs/common';
import { TrainingFeedbackService } from './training-feedback.service';

describe('TrainingFeedbackService', () => {
  it('rejects out-of-scale rating responses', async () => {
    const prisma = {
      employee: {
        findFirst: jest
          .fn()
          .mockResolvedValue({ id: 'employee-1', userId: 'user-1' }),
      },
      trainingCompletion: {
        findFirst: jest.fn().mockResolvedValue({ id: 'completion-1' }),
      },
      trainingFeedbackTemplate: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'template-1',
          ratingScale: 'ONE_TO_FIVE',
          questions: [{ id: 'q1', type: 'RATING', required: true }],
        }),
      },
      trainingFeedback: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn(),
      },
    };

    const service = new TrainingFeedbackService(prisma as never);

    await expect(
      service.createFeedback(
        {
          trainingCompletionId: 'completion-1',
          templateId: 'template-1',
          submissionType: 'IDENTIFIED',
          submit: true,
          responses: [{ questionId: 'q1', value: 7 }],
        },
        'user-1',
      ),
    ).rejects.toThrow(BadRequestException);
    expect(prisma.trainingFeedback.create).not.toHaveBeenCalled();
  });
});
