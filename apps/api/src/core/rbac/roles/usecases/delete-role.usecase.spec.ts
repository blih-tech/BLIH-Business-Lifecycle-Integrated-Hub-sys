import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { DeleteRoleUseCase } from './delete-role.usecase';

describe('DeleteRoleUseCase', () => {
  it('blocks deleting system roles', async () => {
    const keycloakAdmin = {
      deleteRole: jest.fn(),
    };
    const prisma = {
      role: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'role-1',
          name: 'superadmin',
          isSystem: true,
        }),
      },
      userRole: {
        count: jest.fn(),
      },
    };
    const userPermissionSnapshot = {
      invalidateAll: jest.fn(),
    };

    const useCase = new DeleteRoleUseCase(
      keycloakAdmin as never,
      prisma as never,
      userPermissionSnapshot as never,
    );

    await expect(useCase.execute('superadmin')).rejects.toThrow(
      ForbiddenException,
    );

    expect(prisma.userRole.count).not.toHaveBeenCalled();
    expect(keycloakAdmin.deleteRole).not.toHaveBeenCalled();
  });

  it('rejects delete when active assignments exist', async () => {
    const keycloakAdmin = {
      deleteRole: jest.fn(),
    };
    const prisma = {
      role: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'role-2',
          name: 'finance.approver',
          isSystem: false,
        }),
      },
      userRole: {
        count: jest.fn().mockResolvedValue(3),
      },
    };
    const userPermissionSnapshot = {
      invalidateAll: jest.fn(),
    };

    const useCase = new DeleteRoleUseCase(
      keycloakAdmin as never,
      prisma as never,
      userPermissionSnapshot as never,
    );

    await expect(useCase.execute('finance.approver')).rejects.toThrow(
      BadRequestException,
    );

    expect(keycloakAdmin.deleteRole).not.toHaveBeenCalled();
  });
});
