import { BadRequestException } from '@nestjs/common';
import { CreateRoleUseCase } from './create-role.usecase';

describe('CreateRoleUseCase', () => {
  it('rejects when parent role id does not exist', async () => {
    const keycloakAdmin = {
      createRole: jest.fn().mockResolvedValue(undefined),
    };
    const prisma = {
      role: {
        findUnique: jest.fn().mockResolvedValue(null),
        upsert: jest.fn(),
      },
    };
    const userPermissionSnapshot = {
      invalidateAll: jest.fn(),
    };

    const useCase = new CreateRoleUseCase(
      keycloakAdmin as never,
      prisma as never,
      userPermissionSnapshot as never,
    );

    await expect(
      useCase.execute({
        name: 'finance.approver',
        displayName: 'Finance Approver',
        parentRoleId: '8b76752b-df18-45bc-af74-1ea9a0db2e40',
      }),
    ).rejects.toThrow(BadRequestException);

    expect(prisma.role.upsert).not.toHaveBeenCalled();
  });

  it('creates role and invalidates cache', async () => {
    const keycloakAdmin = {
      createRole: jest.fn().mockResolvedValue(undefined),
    };
    const prisma = {
      role: {
        findUnique: jest.fn().mockResolvedValue({ id: 'parent-role' }),
        upsert: jest
          .fn()
          .mockResolvedValue({ id: 'role-1', name: 'finance.approver' }),
      },
    };
    const userPermissionSnapshot = {
      invalidateAll: jest.fn().mockResolvedValue(undefined),
    };

    const useCase = new CreateRoleUseCase(
      keycloakAdmin as never,
      prisma as never,
      userPermissionSnapshot as never,
    );

    await useCase.execute({
      name: 'finance.approver',
      displayName: 'Finance Approver',
      description: 'Approves finance actions',
      parentRoleId: '8b76752b-df18-45bc-af74-1ea9a0db2e40',
    });

    expect(prisma.role.upsert).toHaveBeenCalled();
    expect(userPermissionSnapshot.invalidateAll).toHaveBeenCalledTimes(1);
  });
});
