import { BadRequestException } from '@nestjs/common';
import { SubmitRecruitmentRequestUseCase } from './submit-recruitment-request.usecase';

describe('SubmitRecruitmentRequestUseCase', () => {
  it('requires a position before a request can be submitted', async () => {
    const prisma = {
      recruitmentRequest: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'request-1',
          status: 'DRAFT',
          departmentId: 'dept-1',
          positionId: null,
          type: 'NEW',
          replacementEmployeeId: null,
        }),
        update: jest.fn(),
      },
      department: {
        findUnique: jest
          .fn()
          .mockResolvedValue({ id: 'dept-1', name: 'Engineering' }),
      },
      position: {
        findUnique: jest.fn(),
      },
      employee: {
        findFirst: jest.fn(),
      },
      userEmployment: {
        count: jest.fn(),
      },
    };

    const useCase = new SubmitRecruitmentRequestUseCase(prisma as never);

    await expect(useCase.execute('request-1')).rejects.toThrow(
      BadRequestException,
    );

    expect(prisma.recruitmentRequest.update).not.toHaveBeenCalled();
  });
});
