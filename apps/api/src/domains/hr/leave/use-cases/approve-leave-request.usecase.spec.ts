import { ApproveLeaveRequestUseCase } from './approve-leave-request.usecase';

describe('ApproveLeaveRequestUseCase', () => {
  it('records a structured approval and reconciles attendance after approval', async () => {
    const tx = {
      leaveBalance: {
        update: jest.fn().mockResolvedValue({}),
      },
      leaveApproval: {
        create: jest.fn().mockResolvedValue({ id: 'approval-1' }),
      },
      leaveRequest: {
        update: jest.fn().mockResolvedValue({
          id: 'leave-1',
          requestId: 'LV-2026-0001',
          employeeId: 'employee-1',
          leaveType: 'ANNUAL',
          startDate: new Date('2026-03-09T00:00:00.000Z'),
          endDate: new Date('2026-03-11T00:00:00.000Z'),
          daysRequested: 3,
          reason: null,
          description: null,
          contactDuringLeave: null,
          handoverDelegateId: null,
          handoverNotes: null,
          startHalfDay: false,
          endHalfDay: false,
          balanceSnapshot: null,
          submittedAt: new Date('2026-03-01T00:00:00.000Z'),
          approvalSteps: [
            {
              id: 'approval-1',
              approverId: 'approver-1',
              level: 1,
              decision: 'APPROVED',
              comments: null,
              decidedAt: new Date('2026-03-01T00:00:00.000Z'),
              createdAt: new Date('2026-03-01T00:00:00.000Z'),
            },
          ],
          status: 'APPROVED',
          approvedById: 'approver-1',
          approvedAt: new Date('2026-03-01T00:00:00.000Z'),
          rejectionReason: null,
          createdAt: new Date('2026-03-01T00:00:00.000Z'),
          updatedAt: new Date('2026-03-01T00:00:00.000Z'),
        }),
      },
    };
    const prisma = {
      leaveRequest: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'leave-1',
          employeeId: 'employee-1',
          leaveType: 'ANNUAL',
          startDate: new Date('2026-03-09T00:00:00.000Z'),
          endDate: new Date('2026-03-11T00:00:00.000Z'),
          daysRequested: 3,
          status: 'PENDING',
          approvalSteps: [],
        }),
      },
      $transaction: jest.fn().mockImplementation((callback) => callback(tx)),
    };
    const reconciliation = {
      reconcileRangeForUser: jest.fn().mockResolvedValue(undefined),
    };

    const useCase = new ApproveLeaveRequestUseCase(
      prisma as never,
      reconciliation as never,
    );

    await expect(
      useCase.execute('leave-1', {
        user: { userId: 'approver-1' },
      } as never),
    ).resolves.toMatchObject({
      status: 'APPROVED',
      approvalSteps: [
        expect.objectContaining({
          approverId: 'approver-1',
          decision: 'APPROVED',
        }),
      ],
    });

    expect(tx.leaveApproval.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        leaveRequestId: 'leave-1',
        approverId: 'approver-1',
        level: 1,
        decision: 'APPROVED',
      }),
    });
    expect(reconciliation.reconcileRangeForUser).toHaveBeenCalledWith(
      'employee-1',
      new Date('2026-03-09T00:00:00.000Z'),
      new Date('2026-03-11T00:00:00.000Z'),
    );
  });
});
