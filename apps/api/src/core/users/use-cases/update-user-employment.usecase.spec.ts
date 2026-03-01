import { UpdateUserEmploymentUseCase } from './update-user-employment.usecase';

describe('UpdateUserEmploymentUseCase', () => {
  it('derives the response department from the selected position', async () => {
    const prisma = {
      user: {
        findFirst: jest.fn().mockResolvedValue({ id: 'user-1' }),
        findUnique: jest.fn(),
      },
      userEmployment: {
        findFirst: jest.fn().mockResolvedValue(null),
        findUnique: jest.fn().mockResolvedValue(null),
      },
      position: {
        findUnique: jest
          .fn()
          .mockResolvedValue({ id: 'position-1', departmentId: 'dept-1' }),
      },
      $transaction: jest.fn().mockImplementation(async (callback) =>
        callback({
          userEmployment: {
            upsert: jest.fn().mockResolvedValue({
              id: 'employment-1',
              userId: 'user-1',
              employeeCode: 'EMP-001',
              positionId: 'position-1',
              position: {
                title: 'Backend Engineer',
                departmentId: 'dept-1',
                department: { name: 'Engineering' },
              },
              employmentType: 'FULL_TIME',
              managerEmploymentId: null,
              hiredAt: null,
              probationEndAt: null,
              confirmedAt: null,
              createdAt: new Date('2026-03-01T00:00:00.000Z'),
              updatedAt: new Date('2026-03-01T00:00:00.000Z'),
            }),
          },
          userEmploymentHistory: {
            updateMany: jest.fn().mockResolvedValue({ count: 0 }),
            create: jest.fn().mockResolvedValue({ id: 'history-1' }),
          },
        }),
      ),
    };

    const useCase = new UpdateUserEmploymentUseCase(prisma as never);

    await expect(
      useCase.execute('user-1', {
        positionId: 'position-1',
      }),
    ).resolves.toMatchObject({
      departmentId: 'dept-1',
      departmentName: 'Engineering',
      positionId: 'position-1',
    });
  });

  it('creates an employment history snapshot after an employment update', async () => {
    const tx = {
      userEmployment: {
        upsert: jest.fn().mockResolvedValue({
          id: 'employment-1',
          userId: 'user-1',
          employeeCode: 'EMP-001',
          positionId: 'position-1',
          position: {
            title: 'Backend Engineer',
            departmentId: 'dept-1',
            department: { name: 'Engineering' },
          },
          employmentType: 'FULL_TIME',
          managerEmploymentId: null,
          hiredAt: new Date('2026-03-01T00:00:00.000Z'),
          probationEndAt: null,
          confirmedAt: null,
          createdAt: new Date('2026-03-01T00:00:00.000Z'),
          updatedAt: new Date('2026-03-01T00:00:00.000Z'),
        }),
      },
      userEmploymentHistory: {
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
        create: jest.fn().mockResolvedValue({ id: 'history-1' }),
      },
    };

    const prisma = {
      user: {
        findFirst: jest.fn().mockResolvedValue({ id: 'user-1' }),
        findUnique: jest.fn(),
      },
      userEmployment: {
        findFirst: jest.fn().mockResolvedValue(null),
        findUnique: jest.fn().mockResolvedValue({
          id: 'employment-1',
          userId: 'user-1',
          employeeCode: null,
          positionId: null,
          employmentType: 'FULL_TIME',
          managerEmploymentId: null,
          hiredAt: null,
          probationEndAt: null,
          confirmedAt: null,
        }),
      },
      position: {
        findUnique: jest
          .fn()
          .mockResolvedValue({ id: 'position-1', departmentId: 'dept-1' }),
      },
      $transaction: jest.fn().mockImplementation((callback) => callback(tx)),
    };

    const useCase = new UpdateUserEmploymentUseCase(prisma as never);

    await useCase.execute('user-1', {
      positionId: 'position-1',
      changeReason: 'Promotion',
    });

    expect(tx.userEmploymentHistory.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userEmploymentId: 'employment-1',
        departmentId: 'dept-1',
        positionId: 'position-1',
        changeReason: 'Promotion',
      }),
    });
  });
});
