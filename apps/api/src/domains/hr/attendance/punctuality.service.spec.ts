import { PunctualityService } from './punctuality.service';

describe('PunctualityService', () => {
  it('aggregates punctuality trends over a period', async () => {
    const prisma = {
      employee: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'emp-1',
          userId: 'user-1',
        }),
      },
    };
    const calendar = {};

    const service = new PunctualityService(prisma as never, calendar as never);
    jest.spyOn(service, 'list').mockResolvedValue([
      {
        employeeId: 'emp-1',
        date: '2026-03-01',
        status: 'LATE',
        expectedStartMinute: 540,
        actualCheckInAt: '2026-03-01T09:20:00.000Z',
        lateThresholdMinutes: 15,
        minutesLate: 20,
        totalMinutes: 480,
      },
      {
        employeeId: 'emp-1',
        date: '2026-03-02',
        status: 'PRESENT',
        expectedStartMinute: 540,
        actualCheckInAt: '2026-03-02T09:00:00.000Z',
        lateThresholdMinutes: 15,
        minutesLate: 0,
        totalMinutes: 480,
      },
      {
        employeeId: 'emp-1',
        date: '2026-03-03',
        status: 'EARLY_DEPARTURE',
        expectedStartMinute: 540,
        actualCheckInAt: '2026-03-03T09:00:00.000Z',
        lateThresholdMinutes: 15,
        minutesLate: 0,
        totalMinutes: 420,
      },
    ] as never);

    const result = await service.trends('emp-1', '2026-03-01', '2026-03-03');

    expect(result).toEqual({
      employeeId: 'emp-1',
      fromDate: '2026-03-01',
      toDate: '2026-03-03',
      totalTrackedDays: 3,
      lateDays: 1,
      earlyDepartureDays: 1,
      absentDays: 0,
      punctualityRate: 33.33,
      averageMinutesLate: 20,
    });
  });
});
