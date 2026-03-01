import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePositionUseCase } from './create-position.usecase';

describe('CreatePositionUseCase', () => {
  it('rejects blank titles after trimming', async () => {
    const prisma = {
      department: {
        findUnique: jest.fn(),
      },
      position: {
        create: jest.fn(),
      },
    };

    const useCase = new CreatePositionUseCase(prisma as never);

    await expect(
      useCase.execute({
        title: '   ',
        departmentId: '8b76752b-df18-45bc-af74-1ea9a0db2e40',
      }),
    ).rejects.toThrow(BadRequestException);

    expect(prisma.position.create).not.toHaveBeenCalled();
  });

  it('rejects unknown departments', async () => {
    const prisma = {
      department: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
      position: {
        create: jest.fn(),
      },
    };

    const useCase = new CreatePositionUseCase(prisma as never);

    await expect(
      useCase.execute({
        title: 'Senior Backend Engineer',
        departmentId: '8b76752b-df18-45bc-af74-1ea9a0db2e40',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('translates duplicate titles into conflict errors', async () => {
    const prisma = {
      department: {
        findUnique: jest.fn().mockResolvedValue({
          id: '8b76752b-df18-45bc-af74-1ea9a0db2e40',
        }),
      },
      position: {
        create: jest.fn().mockRejectedValue(new Error('duplicate')),
      },
    };

    const useCase = new CreatePositionUseCase(prisma as never);

    await expect(
      useCase.execute({
        title: 'Senior Backend Engineer',
        departmentId: '8b76752b-df18-45bc-af74-1ea9a0db2e40',
      }),
    ).rejects.toThrow(ConflictException);
  });
});
