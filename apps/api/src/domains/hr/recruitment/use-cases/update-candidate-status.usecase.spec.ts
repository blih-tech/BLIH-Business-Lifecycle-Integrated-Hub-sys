import { BadRequestException } from '@nestjs/common';
import { UpdateCandidateStatusUseCase } from './update-candidate-status.usecase';

describe('UpdateCandidateStatusUseCase', () => {
  it('blocks invalid pipeline jumps', async () => {
    const prisma = {
      candidate: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'candidate-1',
          status: 'NEW',
          pipeline: {},
        }),
        update: jest.fn(),
      },
    };

    const useCase = new UpdateCandidateStatusUseCase(prisma as never);

    await expect(
      useCase.execute('candidate-1', {
        status: 'HIRED',
      }),
    ).rejects.toThrow(BadRequestException);
    expect(prisma.candidate.update).not.toHaveBeenCalled();
  });
});
