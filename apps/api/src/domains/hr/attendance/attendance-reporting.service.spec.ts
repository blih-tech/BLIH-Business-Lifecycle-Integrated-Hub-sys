import { AttendanceReportingService } from './attendance-reporting.service';

describe('AttendanceReportingService', () => {
  it('aggregates attendance analytics by employee and totals', async () => {
    const prisma = {
      attendanceLog: {
        findMany: jest.fn().mockResolvedValue([
          {
            employeeId: 'emp-1',
            date: new Date('2026-03-01T00:00:00.000Z'),
            status: 'PRESENT',
            totalMinutes: 480,
            overtimeMinutes: 0,
            overtimeApproved: false,
            checkInAt: new Date('2026-03-01T08:00:00.000Z'),
            checkOutAt: new Date('2026-03-01T16:00:00.000Z'),
            notes: null,
            employee: {
              user: { firstName: 'Ada', lastName: 'Lovelace' },
            },
          },
          {
            employeeId: 'emp-1',
            date: new Date('2026-03-02T00:00:00.000Z'),
            status: 'LATE',
            totalMinutes: 450,
            overtimeMinutes: 15,
            overtimeApproved: true,
            checkInAt: new Date('2026-03-02T08:20:00.000Z'),
            checkOutAt: new Date('2026-03-02T15:50:00.000Z'),
            notes: null,
            employee: {
              user: { firstName: 'Ada', lastName: 'Lovelace' },
            },
          },
          {
            employeeId: 'emp-2',
            date: new Date('2026-03-01T00:00:00.000Z'),
            status: 'ABSENT',
            totalMinutes: 0,
            overtimeMinutes: 0,
            overtimeApproved: false,
            checkInAt: null,
            checkOutAt: null,
            notes: null,
            employee: {
              user: { firstName: 'Grace', lastName: 'Hopper' },
            },
          },
        ]),
      },
    };

    const service = new AttendanceReportingService(prisma as never);
    const result = await service.attendanceAnalytics(
      '2026-03-01',
      '2026-03-02',
    );

    expect(result.employeeCount).toBe(2);
    expect(result.totals.workedDays).toBe(2);
    expect(result.totals.absenceDays).toBe(1);
    expect(result.totals.overtimeMinutes).toBe(15);
    expect(result.employees[0]?.employeeName).toBe('Ada Lovelace');
  });

  it('aggregates leave analytics by leave type and status', async () => {
    const prisma = {
      leaveRequest: {
        findMany: jest.fn().mockResolvedValue([
          {
            leaveType: 'ANNUAL',
            status: 'APPROVED',
            daysRequested: 3,
          },
          {
            leaveType: 'ANNUAL',
            status: 'PENDING',
            daysRequested: 2,
          },
          {
            leaveType: 'SICK',
            status: 'REJECTED',
            daysRequested: 1,
          },
        ]),
      },
    };

    const service = new AttendanceReportingService(prisma as never);
    const result = await service.leaveAnalytics('2026-03-01', '2026-03-31');

    expect(result.totalRequests).toBe(3);
    expect(result.approvedRequests).toBe(1);
    expect(result.pendingRequests).toBe(1);
    expect(result.rejectedRequests).toBe(1);
    expect(result.types).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          leaveType: 'ANNUAL',
          approvedDays: 3,
          pendingDays: 2,
        }),
      ]),
    );
  });
});
