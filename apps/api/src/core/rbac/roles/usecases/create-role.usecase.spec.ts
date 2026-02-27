import { BadRequestException } from '@nestjs/common';
import { CreateRoleUseCase } from './create-role.usecase';

describe('CreateRoleUseCase', () => {
  it('rejects unknown parent role id with 400', async () => {
    const keycloakAdmin = {
      createRole: jest.fn().mockResolvedValue(undefined),
    };
    const prisma = {
      role: {
        findUnique: jest
          .fn()
          .mockResolvedValueOnce(null)
          .mockResolvedValueOnce(null),
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
        description: 'Approves finance actions',
        parentRoleId: '57e883d0-d0c0-4187-a232-50fa729f6876',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('creates role metadata and invalidates permission cache', async () => {
    const keycloakAdmin = {
      createRole: jest.fn().mockResolvedValue(undefined),
    };
    const prisma = {
      role: {
        findUnique: jest.fn().mockResolvedValue(null),
        upsert: jest
          .fn()
          .mockResolvedValue({ id: 'role-1', name: 'finance.approver' }),
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

    await useCase.execute({
      name: 'finance.approver',
      displayName: 'Finance Approver',
      description: 'Approves finance actions',
    });

    expect(prisma.role.upsert).toHaveBeenCalled();
    expect(userPermissionSnapshot.invalidateAll).toHaveBeenCalledTimes(1);
  });
});
