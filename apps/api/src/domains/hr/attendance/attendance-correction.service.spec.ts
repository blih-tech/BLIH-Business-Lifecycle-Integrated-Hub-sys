import { AttendanceCorrectionService } from './attendance-correction.service';

describe('AttendanceCorrectionService', () => {
  it('approves a pending correction and triggers reconciliation', async () => {
    const date = new Date('2026-03-04T00:00:00.000Z');
    const request = {
      id: 'correction-1',
      requestId: 'ATC-2026-0001',
      employeeId: 'emp-1',
      attendanceLogId: 'log-1',
      date,
      requestedCheckInAt: new Date('2026-03-04T09:15:00.000Z'),
      requestedCheckOutAt: null,
      requestedStatus: null,
      reason: 'Forgot to check in',
      notes: null,
      status: 'PENDING',
      submittedAt: new Date('2026-03-04T08:00:00.000Z'),
      approvedById: null,
      approvedAt: null,
      rejectionReason: null,
      createdAt: new Date('2026-03-04T08:00:00.000Z'),
      updatedAt: new Date('2026-03-04T08:00:00.000Z'),
    };

    const prisma = {
      attendanceCorrectionRequest: {
        findUnique: jest
          .fn()
          .mockResolvedValueOnce(request)
          .mockResolvedValueOnce({
            ...request,
            status: 'APPROVED',
            approvedById: 'manager-1',
            approvedAt: new Date('2026-03-04T10:00:00.000Z'),
          }),
        update: jest.fn(),
      },
      attendanceLog: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'log-1',
          employeeId: 'emp-1',
          date,
          checkInAt: new Date('2026-03-04T10:00:00.000Z'),
          checkOutAt: null,
          totalMinutes: null,
          status: 'ABSENT',
        }),
        update: jest.fn(),
        create: jest.fn(),
      },
      $transaction: jest.fn().mockImplementation((callback) =>
        callback({
          attendanceCorrectionRequest: {
            update: jest.fn(),
          },
          attendanceLog: {
            findUnique: prisma.attendanceLog.findUnique,
            findFirst: jest.fn(),
            update: jest.fn(),
            create: jest.fn(),
          },
        }),
      ),
    };
    const lifecycle = {};
    const reconciliation = {
      reconcileDateForUser: jest.fn().mockResolvedValue(undefined),
    };

    const service = new AttendanceCorrectionService(
      prisma as never,
      lifecycle as never,
      reconciliation as never,
    );

    const result = await service.approve('correction-1', {
      user: { userId: 'manager-1' },
    } as never);

    expect(reconciliation.reconcileDateForUser).toHaveBeenCalledWith(
      'emp-1',
      date,
    );
    expect(result.status).toBe('APPROVED');
  });
});
