import { TimesheetService } from './timesheet.service';

describe('TimesheetService', () => {
  it('creates a timesheet from reconciled attendance logs', async () => {
    const prisma = {
      timesheet: {
        findFirst: jest.fn().mockResolvedValue(null),
        count: jest.fn().mockResolvedValue(2),
        create: jest.fn().mockImplementation(async ({ data }) => ({
          id: 'timesheet-1',
          timesheetId: 'TIM-2026-0003',
          employeeId: data.employeeId,
          periodStart: data.periodStart,
          periodEnd: data.periodEnd,
          trackedDays: data.trackedDays,
          workedDays: data.workedDays,
          leaveDays: data.leaveDays,
          absenceDays: data.absenceDays,
          remoteDays: data.remoteDays,
          lateCount: data.lateCount,
          earlyDepartureCount: data.earlyDepartureCount,
          totalWorkedMinutes: data.totalWorkedMinutes,
          overtimeMinutes: data.overtimeMinutes,
          attendanceRate: data.attendanceRate,
          punctualityRate: data.punctualityRate,
          sourceSnapshot: data.sourceSnapshot,
          notes: data.notes ?? null,
          status: data.status,
          submittedAt: data.submittedAt,
          approvedById: null,
          approvedAt: null,
          rejectionReason: null,
          createdAt: new Date('2026-03-31T12:00:00.000Z'),
          updatedAt: new Date('2026-03-31T12:00:00.000Z'),
        })),
      },
      attendanceLog: {
        findMany: jest.fn().mockResolvedValue([
          {
            date: new Date('2026-03-01T00:00:00.000Z'),
            status: 'PRESENT',
            totalMinutes: 480,
            overtimeMinutes: 0,
            overtimeApproved: false,
            checkInAt: new Date('2026-03-01T08:00:00.000Z'),
            checkOutAt: new Date('2026-03-01T16:00:00.000Z'),
            notes: null,
          },
          {
            date: new Date('2026-03-02T00:00:00.000Z'),
            status: 'LATE',
            totalMinutes: 450,
            overtimeMinutes: 30,
            overtimeApproved: true,
            checkInAt: new Date('2026-03-02T08:30:00.000Z'),
            checkOutAt: new Date('2026-03-02T16:00:00.000Z'),
            notes: 'Traffic delay',
          },
          {
            date: new Date('2026-03-03T00:00:00.000Z'),
            status: 'ON_LEAVE',
            totalMinutes: 0,
            overtimeMinutes: 0,
            overtimeApproved: false,
            checkInAt: null,
            checkOutAt: null,
            notes: null,
          },
        ]),
      },
    };
    const lifecycle = {
      assertAttendanceAllowed: jest.fn().mockResolvedValue({ id: 'emp-1' }),
    };
    const reconciliation = {
      reconcileRangeForUser: jest.fn().mockResolvedValue(undefined),
    };

    const service = new TimesheetService(
      prisma as never,
      lifecycle as never,
      reconciliation as never,
    );

    const result = await service.create({
      employeeId: 'emp-1',
      periodStart: '2026-03-01',
      periodEnd: '2026-03-03',
      submit: true,
    });

    expect(reconciliation.reconcileRangeForUser).toHaveBeenCalledWith(
      'emp-1',
      new Date('2026-03-01T00:00:00.000Z'),
      new Date('2026-03-03T00:00:00.000Z'),
    );
    expect(prisma.timesheet.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          workedDays: 2,
          leaveDays: 1,
          lateCount: 1,
          overtimeMinutes: 30,
          status: 'PENDING',
        }),
      }),
    );
    expect(result.workedDays).toBe(2);
    expect(result.leaveDays).toBe(1);
    expect(result.lateCount).toBe(1);
    expect(result.sourceSnapshot).toHaveLength(3);
  });
});
