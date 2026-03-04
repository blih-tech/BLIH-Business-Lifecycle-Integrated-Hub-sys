import { SignOffProbationConfirmationUseCase } from './sign-off-probation-confirmation.usecase';

describe('SignOffProbationConfirmationUseCase', () => {
  it('confirms employment and closes the active probation plan', async () => {
    const signedOffAt = new Date('2026-03-15T09:00:00.000Z');
    const record = {
      id: 'confirmation-1',
      employeeId: 'emp-1',
      reviewSummary: { outcome: 'Strong fit' },
      verdict: 'CONFIRM',
      extension: null,
      termination: null,
      confirmation: { notes: 'Proceed' },
      hrCheckedAt: new Date('2026-03-14T09:00:00.000Z'),
      ceoSignOffAt: null,
      employeeNotifiedAt: null,
      archivedInEmployeeFile: false,
      createdAt: new Date('2026-03-10T09:00:00.000Z'),
      updatedAt: new Date('2026-03-10T09:00:00.000Z'),
    };

    const tx = {
      probationConfirmation: {
        update: jest.fn().mockResolvedValue({
          ...record,
          ceoSignOffAt: signedOffAt,
          employeeNotifiedAt: signedOffAt,
          updatedAt: signedOffAt,
        }),
      },
      probationKpiPlan: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'plan-1',
          status: 'ACTIVE',
        }),
        update: jest.fn().mockResolvedValue(undefined),
      },
      userLifecycle: {
        upsert: jest.fn().mockResolvedValue(undefined),
      },
      userEmployment: {
        update: jest.fn().mockResolvedValue(undefined),
      },
    };

    const prisma = {
      probationConfirmation: {
        findUnique: jest.fn().mockResolvedValue(record),
      },
      $transaction: jest.fn().mockImplementation((callback) => callback(tx)),
    };

    const useCase = new SignOffProbationConfirmationUseCase(prisma as never);

    const result = await useCase.execute('confirmation-1', {
      signedOffAt: signedOffAt.toISOString(),
    });

    expect(tx.userLifecycle.upsert).toHaveBeenCalledWith({
      where: { employeeId: 'emp-1' },
      update: {
        status: 'ACTIVE',
        onboardedAt: signedOffAt,
      },
      create: {
        employeeId: 'emp-1',
        status: 'ACTIVE',
        onboardedAt: signedOffAt,
      },
    });
    expect(tx.userEmployment.update).toHaveBeenCalledWith({
      where: { employeeId: 'emp-1' },
      data: {
        confirmedAt: signedOffAt,
      },
    });
    expect(tx.probationKpiPlan.update).toHaveBeenCalledWith({
      where: { id: 'plan-1' },
      data: { status: 'COMPLETED' },
    });
    expect(result.ceoSignOffAt).toBe(signedOffAt.toISOString());
  });
});
