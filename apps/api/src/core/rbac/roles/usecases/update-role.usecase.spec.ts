import { ForbiddenException } from '@nestjs/common';
import { UpdateRoleUseCase } from './update-role.usecase';

describe('UpdateRoleUseCase', () => {
  it('blocks updates for system roles', async () => {
    const keycloakAdmin = {
      updateRole: jest.fn(),
    };
    const prisma = {
      role: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'role-1',
          name: 'superadmin',
          isSystem: true,
        }),
      },
    };
    const userPermissionSnapshot = {
      recomputeAllUsers: jest.fn(),
    };

    const useCase = new UpdateRoleUseCase(
      keycloakAdmin as never,
      prisma as never,
      userPermissionSnapshot as never,
    );

    await expect(
      useCase.execute('superadmin', {
        displayName: 'Super Administrator',
      }),
    ).rejects.toThrow(ForbiddenException);

    expect(keycloakAdmin.updateRole).not.toHaveBeenCalled();
    expect(userPermissionSnapshot.recomputeAllUsers).not.toHaveBeenCalled();
  });
});
