import { ApproveRecruitmentRequestUseCase } from './approve-recruitment-request.usecase';

describe('ApproveRecruitmentRequestUseCase', () => {
  it('derives the next approval level from RecruitmentApproval records', async () => {
    const prisma = {
      recruitmentRequest: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'request-1',
          status: 'PENDING',
          departmentId: 'dept-1',
          positionId: 'position-1',
          type: 'NEW',
          replacementUserId: null,
        }),
        update: jest.fn().mockResolvedValue({
          id: 'request-1',
          requestId: 'REQ-2026-001',
          status: 'APPROVED',
          approvals: [
            {
              level: 1,
              role: 'Finance',
              approverId: 'approver-1',
              status: 'APPROVED',
              decision: 'APPROVE',
              comments: null,
              actedAt: '2026-03-01T00:00:00.000Z',
            },
            {
              level: 2,
              role: 'HR',
              approverId: 'approver-2',
              status: 'APPROVED',
              decision: 'APPROVE',
              comments: 'Looks good',
              actedAt: '2026-03-01T01:00:00.000Z',
            },
          ],
        }),
      },
      recruitmentApproval: {
        findMany: jest.fn().mockResolvedValue([
          {
            level: 1,
            role: 'Finance',
            approverId: 'approver-1',
            decision: 'APPROVE',
            comments: null,
            decidedAt: new Date('2026-03-01T00:00:00.000Z'),
          },
        ]),
        create: jest.fn().mockResolvedValue({ id: 'approval-2' }),
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
          headcountLimit: 4,
          isActive: true,
        }),
      },
      user: {
        findUnique: jest.fn(),
      },
      userEmployment: {
        count: jest.fn().mockResolvedValue(1),
      },
      $transaction: jest
        .fn()
        .mockImplementation((operations) => Promise.all(operations)),
    };

    const useCase = new ApproveRecruitmentRequestUseCase(prisma as never);

    await expect(
      useCase.execute(
        'request-1',
        {
          role: 'HR',
          decision: 'APPROVE',
          comments: 'Looks good',
        },
        'approver-2',
      ),
    ).resolves.toMatchObject({
      requestId: 'REQ-2026-001',
      status: 'APPROVED',
    });

    expect(prisma.recruitmentApproval.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        recruitmentRequestId: 'request-1',
        approverId: 'approver-2',
        level: 2,
        role: 'HR',
        decision: 'APPROVE',
      }),
    });
  });
});
