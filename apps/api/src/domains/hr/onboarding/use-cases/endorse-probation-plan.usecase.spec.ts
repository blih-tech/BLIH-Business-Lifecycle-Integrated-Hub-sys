import { EndorseProbationPlanUseCase } from './endorse-probation-plan.usecase';

describe('EndorseProbationPlanUseCase', () => {
  it('activates the plan after the final required endorsement', async () => {
    const endorsedAt = new Date('2026-03-04T09:00:00.000Z');
    const prisma = {
      probationKpiPlan: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'plan-1',
          status: 'DRAFT',
        }),
        update: jest
          .fn()
          .mockResolvedValueOnce({
            id: 'plan-1',
            employeeId: 'emp-1',
            supervisorId: 'sup-1',
            probationStart: new Date('2026-01-01'),
            probationEnd: new Date('2026-03-31'),
            goals: [{ title: 'Goal 1' }],
            development: {},
            employeeEndorsedAt: new Date('2026-01-02T09:00:00.000Z'),
            supervisorEndorsedAt: new Date('2026-01-03T09:00:00.000Z'),
            hrEndorsedAt: endorsedAt,
            status: 'DRAFT',
            createdAt: new Date('2026-01-01T09:00:00.000Z'),
            updatedAt: endorsedAt,
          })
          .mockResolvedValueOnce({
            id: 'plan-1',
            employeeId: 'emp-1',
            supervisorId: 'sup-1',
            probationStart: new Date('2026-01-01'),
            probationEnd: new Date('2026-03-31'),
            goals: [{ title: 'Goal 1' }],
            development: {},
            employeeEndorsedAt: new Date('2026-01-02T09:00:00.000Z'),
            supervisorEndorsedAt: new Date('2026-01-03T09:00:00.000Z'),
            hrEndorsedAt: endorsedAt,
            status: 'ACTIVE',
            createdAt: new Date('2026-01-01T09:00:00.000Z'),
            updatedAt: endorsedAt,
          }),
      },
    };

    const useCase = new EndorseProbationPlanUseCase(prisma as never);

    const result = await useCase.execute('plan-1', {
      role: 'HR_MANAGER',
      endorsedAt: endorsedAt.toISOString(),
    });

    expect(prisma.probationKpiPlan.update).toHaveBeenNthCalledWith(1, {
      where: { id: 'plan-1' },
      data: { hrEndorsedAt: endorsedAt },
    });
    expect(prisma.probationKpiPlan.update).toHaveBeenNthCalledWith(2, {
      where: { id: 'plan-1' },
      data: { status: 'ACTIVE' },
    });
    expect(result.status).toBe('ACTIVE');
  });
});
