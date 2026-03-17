import { FlexWorkRequestService } from './flex-work-request.service';

describe('FlexWorkRequestService', () => {
  it('approves a pending flex request and reconciles the affected range', async () => {
    const request = {
      id: 'flex-1',
      requestId: 'FLX-2026-0001',
      employeeId: 'emp-1',
      requestType: 'WORK_FROM_HOME',
      startDate: new Date('2026-03-10T00:00:00.000Z'),
      endDate: new Date('2026-03-12T00:00:00.000Z'),
      requestedStartMinute: null,
      requestedEndMinute: null,
      reason: 'Home internet installation',
      details: null,
      status: 'PENDING',
      submittedAt: new Date('2026-03-05T08:00:00.000Z'),
      approvedById: null,
      approvedAt: null,
      rejectionReason: null,
      createdAt: new Date('2026-03-05T08:00:00.000Z'),
      updatedAt: new Date('2026-03-05T08:00:00.000Z'),
    };

    const prisma = {
      flexWorkRequest: {
        findUnique: jest.fn().mockResolvedValue(request),
        update: jest.fn().mockResolvedValue({
          ...request,
          status: 'APPROVED',
          approvedById: 'manager-1',
          approvedAt: new Date('2026-03-06T09:00:00.000Z'),
        }),
      },
    };
    const lifecycle = {};
    const calendar = {};
    const reconciliation = {
      reconcileRangeForUser: jest.fn().mockResolvedValue(undefined),
    };

    const service = new FlexWorkRequestService(
      prisma as never,
      lifecycle as never,
      calendar as never,
      reconciliation as never,
    );

    const result = await service.approve('flex-1', {
      user: { userId: 'manager-1' },
    } as never);

    expect(reconciliation.reconcileRangeForUser).toHaveBeenCalledWith(
      'emp-1',
      request.startDate,
      request.endDate,
    );
    expect(result.status).toBe('APPROVED');
  });
});
