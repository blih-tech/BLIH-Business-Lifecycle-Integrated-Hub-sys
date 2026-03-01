import { BadRequestException } from '@nestjs/common';
import { CreateJobPostingFromRequestUseCase } from './create-job-posting-from-request.usecase';

describe('CreateJobPostingFromRequestUseCase', () => {
  it('rejects requests that already have a linked posting', async () => {
    const prisma = {
      recruitmentRequest: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'request-1',
          status: 'APPROVED',
          departmentId: 'dept-1',
          type: 'NEW',
          replacementUserId: null,
          positionId: 'position-1',
          linkedJobPostingId: 'posting-1',
          position: { title: 'Backend Engineer' },
        }),
        update: jest.fn(),
      },
      department: {
        findUnique: jest.fn(),
      },
      position: {
        findUnique: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
      },
      userEmployment: {
        count: jest.fn(),
      },
      jobPosting: {
        count: jest.fn(),
        create: jest.fn(),
      },
    };

    const useCase = new CreateJobPostingFromRequestUseCase(prisma as never);

    await expect(
      useCase.execute('request-1', {
        description: { summary: 'Role summary' },
      }),
    ).rejects.toThrow(BadRequestException);

    expect(prisma.jobPosting.create).not.toHaveBeenCalled();
  });

  it('stores the relational position and optional snapshot payload', async () => {
    const prisma = {
      recruitmentRequest: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'request-1',
          requestId: 'REQ-2026-001',
          status: 'APPROVED',
          departmentId: 'dept-1',
          type: 'NEW',
          replacementUserId: null,
          positionId: 'position-1',
          linkedJobPostingId: null,
          position: { title: 'Backend Engineer' },
        }),
        update: jest.fn().mockResolvedValue({ id: 'request-1' }),
      },
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
          headcountLimit: 3,
          isActive: true,
        }),
      },
      user: {
        findUnique: jest.fn(),
      },
      userEmployment: {
        count: jest.fn().mockResolvedValue(1),
      },
      jobPosting: {
        count: jest.fn().mockResolvedValue(0),
        create: jest.fn().mockResolvedValue({
          id: 'posting-1',
          postingId: 'POST-2026-001',
          recruitmentRequestId: 'request-1',
          positionId: 'position-1',
          position: { id: 'position-1', title: 'Backend Engineer' },
          positionSnapshot: { title: 'Snapshot title' },
          description: { summary: 'Role summary' },
          prerequisites: null,
          kpis: null,
          platforms: ['linkedin'],
          status: 'DRAFT',
          postedAt: null,
          expiresAt: null,
          closedAt: null,
          createdAt: new Date('2026-03-01T00:00:00.000Z'),
          updatedAt: new Date('2026-03-01T00:00:00.000Z'),
        }),
      },
    };

    const useCase = new CreateJobPostingFromRequestUseCase(prisma as never);

    await expect(
      useCase.execute('request-1', {
        positionSnapshot: { title: 'Snapshot title' },
        description: { summary: 'Role summary' },
        platforms: ['linkedin'],
      }),
    ).resolves.toMatchObject({
      postingId: 'POST-2026-001',
      positionId: 'position-1',
      positionSnapshot: { title: 'Snapshot title' },
    });

    expect(prisma.jobPosting.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        positionId: 'position-1',
        positionSnapshot: { title: 'Snapshot title' },
      }),
      include: expect.any(Object),
    });
  });
});
