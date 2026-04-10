import { CancelLeaveRequestUseCase } from './cancel-leave-request.usecase';

describe('CancelLeaveRequestUseCase', () => {
  it('cancels approved future leave and re-reconciles attendance', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const startDate = new Date(futureDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(futureDate);
    endDate.setDate(endDate.getDate() + 2);
    endDate.setHours(0, 0, 0, 0);
    const existing = {
      id: 'leave-1',
      requestId: 'LV-2026-0001',
      employeeId: 'emp-1',
      leaveType: 'ANNUAL',
      startDate,
      endDate,
      daysRequested: 3,
      reason: null,
      description: null,
      contactDuringLeave: null,
      handoverDelegateId: null,
      handoverNotes: null,
      startHalfDay: false,
      endHalfDay: false,
      balanceSnapshot: null,
      submittedAt: new Date('2026-03-01T08:00:00.000Z'),
      approvalSteps: [],
      status: 'APPROVED',
      approvedById: 'manager-1',
      approvedAt: new Date('2026-03-02T08:00:00.000Z'),
      rejectionReason: null,
      createdAt: new Date('2026-03-01T08:00:00.000Z'),
      updatedAt: new Date('2026-03-02T08:00:00.000Z'),
    };

    const tx = {
      leaveBalance: {
        update: jest.fn().mockResolvedValue(undefined),
        findUnique: jest.fn(),
      },
      leaveRequest: {
        update: jest.fn().mockResolvedValue({
          ...existing,
          status: 'CANCELLED',
        }),
      },
    };
    const prisma = {
      leaveRequest: {
        findUnique: jest.fn().mockResolvedValue(existing),
      },
      $transaction: jest.fn().mockImplementation((callback) => callback(tx)),
    };
    const reconciliation = {
      reconcileRangeForUser: jest.fn().mockResolvedValue(undefined),
    };

    const useCase = new CancelLeaveRequestUseCase(
      prisma as never,
      reconciliation as never,
    );

    const result = await useCase.execute('leave-1');

    expect(tx.leaveBalance.update).toHaveBeenCalledWith({
      where: {
        employeeId_leaveType_year: {
          employeeId: 'emp-1',
          leaveType: 'ANNUAL',
          year: 2026,
        },
      },
      data: {
        usedDays: { decrement: 3 },
      },
    });
    expect(reconciliation.reconcileRangeForUser).toHaveBeenCalledWith(
      'emp-1',
      startDate,
      endDate,
    );
    expect(result.status).toBe('CANCELLED');
  });
});
