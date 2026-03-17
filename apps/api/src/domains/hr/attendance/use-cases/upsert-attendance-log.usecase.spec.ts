import { UpsertAttendanceLogUseCase } from './upsert-attendance-log.usecase';

describe('UpsertAttendanceLogUseCase', () => {
  it('reconciles attendance automatically when status is not manually overridden', async () => {
    const prisma = {
      attendanceLog: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({
          id: 'attendance-1',
          employeeId: 'employee-1',
          date: new Date('2026-03-10T00:00:00.000Z'),
          checkInAt: new Date('2026-03-10T09:30:00.000Z'),
          checkOutAt: new Date('2026-03-10T17:30:00.000Z'),
          totalMinutes: 480,
          status: 'PRESENT',
          isAutoCalculated: true,
          overtimeMinutes: 0,
          overtimeApproved: false,
          checkInMethod: null,
          checkOutMethod: null,
          checkInIp: null,
          checkInLocation: null,
          reconciledAt: null,
          notes: null,
          createdAt: new Date('2026-03-10T00:00:00.000Z'),
          updatedAt: new Date('2026-03-10T00:00:00.000Z'),
        }),
      },
    };
    const lifecycle = {
      assertAttendanceAllowed: jest
        .fn()
        .mockResolvedValue({ id: 'employee-1' }),
    };
    const reconciliation = {
      reconcileDateForUser: jest.fn().mockResolvedValue({
        id: 'attendance-1',
        employeeId: 'employee-1',
        date: new Date('2026-03-10T00:00:00.000Z'),
        checkInAt: new Date('2026-03-10T09:30:00.000Z'),
        checkOutAt: new Date('2026-03-10T17:30:00.000Z'),
        totalMinutes: 480,
        status: 'LATE',
        isAutoCalculated: true,
        overtimeMinutes: 0,
        overtimeApproved: false,
        checkInMethod: null,
        checkOutMethod: null,
        checkInIp: null,
        checkInLocation: null,
        reconciledAt: new Date('2026-03-10T17:31:00.000Z'),
        notes: null,
        createdAt: new Date('2026-03-10T00:00:00.000Z'),
        updatedAt: new Date('2026-03-10T00:00:00.000Z'),
      }),
    };

    const useCase = new UpsertAttendanceLogUseCase(
      prisma as never,
      lifecycle as never,
      reconciliation as never,
    );

    await expect(
      useCase.execute({
        employeeId: 'employee-1',
        date: '2026-03-10',
        checkInAt: '2026-03-10T09:30:00.000Z',
        checkOutAt: '2026-03-10T17:30:00.000Z',
      }),
    ).resolves.toMatchObject({
      status: 'LATE',
      isAutoCalculated: true,
    });

    expect(reconciliation.reconcileDateForUser).toHaveBeenCalledWith(
      'employee-1',
      new Date('2026-03-10T00:00:00.000Z'),
    );
  });

  it('keeps manual status overrides when explicitly provided', async () => {
    const prisma = {
      attendanceLog: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({
          id: 'attendance-1',
          employeeId: 'employee-1',
          date: new Date('2026-03-10T00:00:00.000Z'),
          checkInAt: null,
          checkOutAt: null,
          totalMinutes: null,
          status: 'REMOTE',
          isAutoCalculated: false,
          overtimeMinutes: null,
          overtimeApproved: false,
          checkInMethod: null,
          checkOutMethod: null,
          checkInIp: null,
          checkInLocation: null,
          reconciledAt: new Date('2026-03-10T00:00:00.000Z'),
          notes: 'Remote work',
          createdAt: new Date('2026-03-10T00:00:00.000Z'),
          updatedAt: new Date('2026-03-10T00:00:00.000Z'),
        }),
      },
    };
    const lifecycle = {
      assertAttendanceAllowed: jest
        .fn()
        .mockResolvedValue({ id: 'employee-1' }),
    };
    const reconciliation = {
      reconcileDateForUser: jest.fn(),
    };

    const useCase = new UpsertAttendanceLogUseCase(
      prisma as never,
      lifecycle as never,
      reconciliation as never,
    );

    await expect(
      useCase.execute({
        employeeId: 'employee-1',
        date: '2026-03-10',
        status: 'REMOTE',
        recalculateStatus: false,
        notes: 'Remote work',
      }),
    ).resolves.toMatchObject({
      status: 'REMOTE',
      isAutoCalculated: false,
    });

    expect(reconciliation.reconcileDateForUser).not.toHaveBeenCalled();
  });
});
