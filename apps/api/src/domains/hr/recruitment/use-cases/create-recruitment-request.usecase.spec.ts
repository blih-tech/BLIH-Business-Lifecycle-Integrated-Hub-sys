import { BadRequestException } from '@nestjs/common';
import { CreateRecruitmentRequestUseCase } from './create-recruitment-request.usecase';

describe('CreateRecruitmentRequestUseCase', () => {
  it('rejects positions that belong to another department', async () => {
    const prisma = {
      department: {
        findUnique: jest
          .fn()
          .mockResolvedValue({ id: 'dept-1', name: 'Engineering' }),
      },
      position: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'position-1',
          title: 'Backend Engineer',
          departmentId: 'dept-2',
          headcountLimit: 3,
          isActive: true,
        }),
      },
      employee: {
        findFirst: jest.fn(),
      },
      userEmployment: {
        count: jest.fn(),
      },
      recruitmentRequest: {
        count: jest.fn(),
        create: jest.fn(),
      },
    };

    const useCase = new CreateRecruitmentRequestUseCase(prisma as never);

    await expect(
      useCase.execute(
        {
          departmentId: 'dept-1',
          positionId: 'position-1',
        },
        'user-1',
      ),
    ).rejects.toThrow(BadRequestException);

    expect(prisma.recruitmentRequest.create).not.toHaveBeenCalled();
  });

  it('allows a replacement request to reuse the incumbent seat at headcount limit', async () => {
    const prisma = {
      department: {
        findUnique: jest
          .fn()
          .mockResolvedValue({ id: 'dept-1', name: 'Engineering' }),
      },
      position: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'position-1',
          title: 'Backend Engineer',
          departmentId: 'dept-1',
          headcountLimit: 1,
          isActive: true,
        }),
      },
      employee: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'employee-2',
          employment: {
            id: 'employment-1',
            positionId: 'position-1',
            position: { departmentId: 'dept-1' },
          },
        }),
      },
      userEmployment: {
        count: jest.fn().mockResolvedValue(1),
      },
      recruitmentRequest: {
        count: jest.fn().mockResolvedValue(0),
        create: jest.fn().mockResolvedValue({
          id: 'request-1',
          requestId: 'REQ-2026-001',
          departmentId: 'dept-1',
          department: { name: 'Engineering' },
          positionId: 'position-1',
          position: { title: 'Backend Engineer' },
          type: 'REPLACEMENT',
          status: 'DRAFT',
          submittedById: 'user-1',
          submittedBy: { email: 'manager@example.com' },
          submittedAt: null,
          createdAt: new Date('2026-03-01T00:00:00.000Z'),
          updatedAt: new Date('2026-03-01T00:00:00.000Z'),
        }),
      },
    };

    const useCase = new CreateRecruitmentRequestUseCase(prisma as never);

    await expect(
      useCase.execute(
        {
          departmentId: 'dept-1',
          positionId: 'position-1',
          type: 'REPLACEMENT',
          replacementEmployeeId: 'employee-2',
        },
        'user-1',
      ),
    ).resolves.toMatchObject({
      requestId: 'REQ-2026-001',
      positionId: 'position-1',
      type: 'REPLACEMENT',
    });

    expect(prisma.recruitmentRequest.create).toHaveBeenCalled();
  });
});
