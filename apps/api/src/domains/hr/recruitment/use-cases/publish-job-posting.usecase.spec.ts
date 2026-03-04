import { BadRequestException } from '@nestjs/common';
import { PublishJobPostingUseCase } from './publish-job-posting.usecase';

describe('PublishJobPostingUseCase', () => {
  it('rejects postings that do not meet the minimum skill threshold', async () => {
    const prisma = {
      jobPosting: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'posting-1',
          postingId: 'POST-2026-001',
          status: 'DRAFT',
          prerequisites: {
            techSkills: ['TypeScript', 'NestJS'],
          },
          expiresAt: null,
          recruitmentRequest: {
            id: 'request-1',
            requestId: 'REQ-2026-001',
            status: 'APPROVED',
            staffing: {
              salaryBracket: { min: 50000, max: 80000 },
            },
            submittedById: 'user-1',
          },
          position: {
            title: 'Backend Engineer',
            grade: {
              minSalary: 50000,
              maxSalary: 80000,
            },
          },
          _count: { candidates: 0 },
        }),
        update: jest.fn(),
      },
    };
    const notifications = {
      notifyUsers: jest.fn(),
    };

    const useCase = new PublishJobPostingUseCase(
      prisma as never,
      notifications as never,
    );

    await expect(useCase.execute('posting-1')).rejects.toThrow(
      BadRequestException,
    );
    expect(prisma.jobPosting.update).not.toHaveBeenCalled();
  });

  it('publishes qualifying postings with a default 30 day expiry', async () => {
    const prisma = {
      jobPosting: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'posting-1',
          postingId: 'POST-2026-001',
          status: 'DRAFT',
          prerequisites: {
            techSkills: ['TypeScript', 'NestJS', 'PostgreSQL'],
          },
          expiresAt: null,
          recruitmentRequest: {
            id: 'request-1',
            requestId: 'REQ-2026-001',
            status: 'APPROVED',
            staffing: {
              salaryBracket: { min: 50000, max: 80000 },
            },
            submittedById: 'user-1',
          },
          position: {
            title: 'Backend Engineer',
            grade: {
              minSalary: 50000,
              maxSalary: 80000,
            },
          },
          _count: { candidates: 0 },
        }),
        update: jest
          .fn()
          .mockImplementation(
            async ({
              data,
            }: {
              data: { postedAt: Date; expiresAt: Date };
            }) => ({
              id: 'posting-1',
              postingId: 'POST-2026-001',
              recruitmentRequestId: 'request-1',
              positionId: 'position-1',
              position: { title: 'Backend Engineer' },
              positionSnapshot: null,
              description: null,
              prerequisites: {
                techSkills: ['TypeScript', 'NestJS', 'PostgreSQL'],
              },
              kpis: null,
              platforms: [],
              status: 'PUBLISHED',
              postedAt: data.postedAt,
              expiresAt: data.expiresAt,
              closedAt: null,
              createdAt: new Date('2026-03-01T00:00:00.000Z'),
              updatedAt: new Date('2026-03-01T00:00:00.000Z'),
              _count: { candidates: 0 },
            }),
          ),
      },
    };
    const notifications = {
      notifyUsers: jest.fn().mockResolvedValue(undefined),
    };

    const useCase = new PublishJobPostingUseCase(
      prisma as never,
      notifications as never,
    );

    const result = await useCase.execute('posting-1');

    expect(result.status).toBe('PUBLISHED');
    expect(result.postedAt).not.toBeNull();
    expect(result.expiresAt).not.toBeNull();

    const postedAt = new Date(result.postedAt as string);
    const expiresAt = new Date(result.expiresAt as string);
    const diffDays = Math.round(
      (expiresAt.getTime() - postedAt.getTime()) / (1000 * 60 * 60 * 24),
    );
    expect(diffDays).toBe(30);
  });
});
