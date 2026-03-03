import { BadRequestException } from '@nestjs/common';
import { CreateLeaveRequestUseCase } from './create-leave-request.usecase';

describe('CreateLeaveRequestUseCase', () => {
  it('creates and reserves a submitted leave request using computed working days', async () => {
    const tx = {
      leaveBalance: {
        update: jest.fn().mockResolvedValue({}),
      },
      leaveRequest: {
        create: jest.fn().mockResolvedValue({
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
          balanceSnapshot: {
            year: 2026,
            leaveType: 'ANNUAL',
            totalDays: 20,
            carriedOver: 0,
            used: 2,
            pending: 1,
            available: 17,
            requested: 3,
          },
          submittedAt: new Date('2026-03-01T00:00:00.000Z'),
          approvalSteps: [],
          status: 'PENDING',
          approvedById: null,
          approvedAt: null,
          rejectionReason: null,
          createdAt: new Date('2026-03-01T00:00:00.000Z'),
          updatedAt: new Date('2026-03-01T00:00:00.000Z'),
        }),
      },
    };

    const prisma = {
      user: {
        findUnique: jest.fn(),
      },
      leaveRequest: {
        findFirst: jest.fn().mockResolvedValue(null),
        count: jest.fn().mockResolvedValue(0),
      },
      $transaction: jest.fn().mockImplementation((callback) => callback(tx)),
    };
    const lifecycle = {
      getUserForLeave: jest.fn().mockResolvedValue({
        id: 'employee-1',
        userId: 'user-1',
        employment: { employmentType: 'FULL_TIME' },
      }),
    };
    const calendar = {
      getWorkingDatesForUser: jest
        .fn()
        .mockResolvedValue([
          new Date('2026-03-09T00:00:00.000Z'),
          new Date('2026-03-10T00:00:00.000Z'),
          new Date('2026-03-11T00:00:00.000Z'),
        ]),
    };
    const leaveBalance = {
      ensureBalance: jest.fn().mockResolvedValue({
        leaveType: 'ANNUAL',
        year: 2026,
        totalDays: 20,
        carriedOver: 0,
        usedDays: 2,
        pendingDays: 1,
        availableDays: 17,
      }),
      assertAvailability: jest.fn(),
    };

    const useCase = new CreateLeaveRequestUseCase(
      prisma as never,
      lifecycle as never,
      calendar as never,
      leaveBalance as never,
    );

    await expect(
      useCase.execute({
        employeeId: 'employee-1',
        leaveType: 'ANNUAL',
        startDate: '2026-03-09',
        endDate: '2026-03-11',
        daysRequested: 3,
        submit: true,
      }),
    ).resolves.toMatchObject({
      requestId: 'LV-2026-0001',
      status: 'PENDING',
      daysRequested: 3,
      approvalSteps: [],
    });

    expect(leaveBalance.assertAvailability).toHaveBeenCalledWith(
      expect.objectContaining({ availableDays: 17 }),
      3,
    );
    expect(tx.leaveBalance.update).toHaveBeenCalledWith({
      where: {
        employeeId_leaveType_year: {
          employeeId: 'employee-1',
          leaveType: 'ANNUAL',
          year: 2026,
        },
      },
      data: {
        pendingDays: { increment: 3 },
      },
    });
  });

  it('rejects when provided daysRequested does not match working-day calculation', async () => {
    const prisma = {
      leaveRequest: {
        findFirst: jest.fn(),
        count: jest.fn(),
      },
      $transaction: jest.fn(),
      user: {
        findUnique: jest.fn(),
      },
    };
    const lifecycle = {
      getUserForLeave: jest.fn().mockResolvedValue({
        id: 'employee-1',
        userId: 'user-1',
        employment: { employmentType: 'FULL_TIME' },
      }),
    };
    const calendar = {
      getWorkingDatesForUser: jest
        .fn()
        .mockResolvedValue([
          new Date('2026-03-09T00:00:00.000Z'),
          new Date('2026-03-10T00:00:00.000Z'),
        ]),
    };
    const leaveBalance = {
      ensureBalance: jest.fn(),
      assertAvailability: jest.fn(),
    };

    const useCase = new CreateLeaveRequestUseCase(
      prisma as never,
      lifecycle as never,
      calendar as never,
      leaveBalance as never,
    );

    await expect(
      useCase.execute({
        employeeId: 'employee-1',
        leaveType: 'ANNUAL',
        startDate: '2026-03-09',
        endDate: '2026-03-10',
        daysRequested: 3,
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
