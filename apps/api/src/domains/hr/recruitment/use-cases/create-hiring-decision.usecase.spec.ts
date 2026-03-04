import { BadRequestException, ConflictException } from '@nestjs/common';
import { CreateHiringDecisionUseCase } from './create-hiring-decision.usecase';

describe('CreateHiringDecisionUseCase', () => {
  it('rejects candidates that do not belong to the selected job posting', async () => {
    const prisma = {
      candidate: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'candidate-1',
          jobPostingId: 'posting-2',
          status: 'INTERVIEW_STAGE',
        }),
      },
      jobPosting: {
        findUnique: jest.fn(),
      },
      recruitmentRequest: {
        findUnique: jest.fn(),
      },
      hiringDecision: {
        findFirst: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
      },
    };

    const useCase = new CreateHiringDecisionUseCase(prisma as never);

    await expect(
      useCase.execute(
        {
          candidateId: 'candidate-1',
          jobPostingId: 'posting-1',
          recruitmentRequestId: 'request-1',
        },
        'user-1',
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects duplicate hiring decisions for the same candidate', async () => {
    const prisma = {
      candidate: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'candidate-1',
          jobPostingId: 'posting-1',
          status: 'INTERVIEW_STAGE',
        }),
      },
      jobPosting: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'posting-1',
          recruitmentRequestId: 'request-1',
          status: 'APPROVED',
        }),
      },
      recruitmentRequest: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'request-1',
          status: 'APPROVED',
        }),
      },
      hiringDecision: {
        findFirst: jest.fn().mockResolvedValue({ id: 'decision-1' }),
        count: jest.fn(),
        create: jest.fn(),
      },
    };

    const useCase = new CreateHiringDecisionUseCase(prisma as never);

    await expect(
      useCase.execute(
        {
          candidateId: 'candidate-1',
          jobPostingId: 'posting-1',
          recruitmentRequestId: 'request-1',
        },
        'user-1',
      ),
    ).rejects.toThrow(ConflictException);
  });
});
