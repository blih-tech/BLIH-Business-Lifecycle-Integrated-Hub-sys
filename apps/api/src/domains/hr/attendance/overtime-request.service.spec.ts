import { OvertimeRequestService } from './overtime-request.service';

describe('OvertimeRequestService', () => {
  it('approves overtime and creates an attendance log when none exists', async () => {
    const date = new Date('2026-03-04T00:00:00.000Z');
    const request = {
      id: 'ot-1',
      requestId: 'OT-2026-0001',
      employeeId: 'emp-1',
      attendanceLogId: null,
      date,
      requestedMinutes: 120,
      reason: 'Production support',
      notes: null,
      status: 'PENDING',
      submittedAt: new Date('2026-03-04T08:00:00.000Z'),
      approvedById: null,
      approvedAt: null,
      rejectionReason: null,
      createdAt: new Date('2026-03-04T08:00:00.000Z'),
      updatedAt: new Date('2026-03-04T08:00:00.000Z'),
    };

    const tx = {
      overtimeRequest: {
        update: jest.fn(),
      },
      attendanceLog: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn(),
        update: jest.fn(),
      },
    };
    const prisma = {
      overtimeRequest: {
        findUnique: jest
          .fn()
          .mockResolvedValueOnce(request)
          .mockResolvedValueOnce({
            ...request,
            status: 'APPROVED',
            approvedById: 'manager-1',
            approvedAt: new Date('2026-03-04T10:00:00.000Z'),
          }),
      },
      $transaction: jest.fn().mockImplementation((callback) => callback(tx)),
    };
    const lifecycle = {};

    const service = new OvertimeRequestService(
      prisma as never,
      lifecycle as never,
    );

    const result = await service.approve('ot-1', {
      user: { userId: 'manager-1' },
    } as never);

    expect(tx.attendanceLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        employeeId: 'emp-1',
        overtimeMinutes: 120,
        overtimeApproved: true,
      }),
    });
    expect(result.status).toBe('APPROVED');
  });
});
