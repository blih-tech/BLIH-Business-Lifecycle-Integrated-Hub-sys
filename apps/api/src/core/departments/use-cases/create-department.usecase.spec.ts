import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@repo/database';
import { CreateDepartmentUseCase } from './create-department.usecase';

describe('CreateDepartmentUseCase', () => {
  it('rejects blank names after trimming', async () => {
    const prisma = {
      department: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };

    const useCase = new CreateDepartmentUseCase(prisma as never);

    await expect(
      useCase.execute({
        name: '   ',
      }),
    ).rejects.toThrow(BadRequestException);

    expect(prisma.department.create).not.toHaveBeenCalled();
  });

  it('rejects unknown parent departments', async () => {
    const prisma = {
      department: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn(),
      },
    };

    const useCase = new CreateDepartmentUseCase(prisma as never);

    await expect(
      useCase.execute({
        name: 'Engineering',
        parentId: '8b76752b-df18-45bc-af74-1ea9a0db2e40',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('translates duplicate names into conflict errors', async () => {
    const prisma = {
      department: {
        findUnique: jest.fn(),
        create: jest.fn().mockRejectedValue(
          new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
            code: 'P2002',
            clientVersion: 'test',
          }),
        ),
      },
    };

    const useCase = new CreateDepartmentUseCase(prisma as never);

    await expect(
      useCase.execute({
        name: 'Engineering',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('creates a department without a parent', async () => {
    const created = {
      id: 'dept-1',
      name: 'Engineering',
      parentId: null,
    };
    const prisma = {
      department: {
        findUnique: jest.fn(),
        create: jest.fn().mockResolvedValue(created),
      },
    };

    const useCase = new CreateDepartmentUseCase(prisma as never);
    const result = await useCase.execute({ name: 'Engineering' });

    expect(result).toEqual(created);
    expect(prisma.department.create).toHaveBeenCalledWith({
      data: {
        name: 'Engineering',
        description: null,
        parentId: null,
      },
      select: {
        id: true,
        name: true,
        parentId: true,
      },
    });
  });
});
