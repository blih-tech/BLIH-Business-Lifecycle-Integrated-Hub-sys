import { TrainingComplianceService } from './training-compliance.service';

describe('TrainingComplianceService', () => {
  it('computes compliance status from compliance requests and completions', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 20);

    const prisma = {
      trainingRequest: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'request-1',
            employeeId: 'employee-1',
            departmentId: 'dept-1',
            title: 'Security Awareness',
            status: 'APPROVED',
            startDate: null,
            endDate: null,
            approvedAt: new Date('2026-01-02T00:00:00.000Z'),
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            approvedById: 'manager-1',
            completions: [
              {
                id: 'completion-1',
                completionStatus: 'COMPLETED',
                expiryDate: futureDate,
                createdAt: new Date('2026-01-03T00:00:00.000Z'),
              },
            ],
          },
          {
            id: 'request-2',
            employeeId: 'employee-2',
            departmentId: 'dept-1',
            title: 'Code of Conduct',
            status: 'APPROVED',
            startDate: null,
            endDate: null,
            approvedAt: new Date('2026-01-04T00:00:00.000Z'),
            createdAt: new Date('2026-01-04T00:00:00.000Z'),
            approvedById: 'manager-1',
            completions: [],
          },
        ]),
      },
    };

    const service = new TrainingComplianceService(prisma as never);

    const status = await service.getStatus({ departmentId: 'dept-1' });

    expect(status.totalRequirements).toBe(2);
    expect(status.compliantCount).toBe(1);
    expect(status.overdueCount).toBe(1);
    expect(status.complianceRate).toBe(50);
  });
});
