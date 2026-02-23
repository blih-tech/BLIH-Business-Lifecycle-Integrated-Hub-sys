import { BadRequestException } from '@nestjs/common';
import { CreateRoleUseCase } from './create-role.usecase';

describe('CreateRoleUseCase', () => {
  it('rejects unknown permission keys with 400', async () => {
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
      permission: {
        findMany: jest
          .fn()
          .mockResolvedValue([{ id: 'perm-1', slug: 'invoice:view' }]),
        upsert: jest.fn(),
      },
      permissionAction: {
        upsert: jest.fn(),
      },
      permissionResource: {
        findUnique: jest.fn(),
      },
      rolePermission: {
        deleteMany: jest.fn(),
        createMany: jest.fn(),
      },
    };
    const userPermissionSnapshot = {
      recomputeAllUsers: jest.fn(),
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
        permissions: ['invoice:view', 'invoice:approve'],
      }),
    ).rejects.toThrow(BadRequestException);

    expect(prisma.permission.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { slug: { in: ['invoice:view', 'invoice:approve'] } },
      }),
    );
    expect(prisma.rolePermission.deleteMany).not.toHaveBeenCalled();
    expect(prisma.permission.upsert).not.toHaveBeenCalled();
    expect(prisma.permissionAction.upsert).not.toHaveBeenCalled();
    expect(prisma.permissionResource.findUnique).not.toHaveBeenCalled();
  });

  it('binds only existing permissions and never upserts permission catalog rows', async () => {
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
      permission: {
        findMany: jest.fn().mockResolvedValue([
          { id: 'perm-1', slug: 'invoice:view' },
          { id: 'perm-2', slug: 'invoice:approve' },
        ]),
        upsert: jest.fn(),
      },
      permissionAction: {
        upsert: jest.fn(),
      },
      permissionResource: {
        findUnique: jest.fn(),
      },
      rolePermission: {
        deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
        createMany: jest.fn().mockResolvedValue({ count: 2 }),
      },
    };
    const userPermissionSnapshot = {
      recomputeAllUsers: jest.fn().mockResolvedValue(undefined),
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
      permissions: ['invoice:view', 'invoice:approve'],
    });

    expect(prisma.rolePermission.deleteMany).toHaveBeenCalledWith({
      where: { roleId: 'role-1' },
    });
    expect(prisma.rolePermission.createMany).toHaveBeenCalledWith({
      data: [
        { roleId: 'role-1', permissionId: 'perm-1' },
        { roleId: 'role-1', permissionId: 'perm-2' },
      ],
      skipDuplicates: true,
    });
    expect(userPermissionSnapshot.recomputeAllUsers).toHaveBeenCalledTimes(1);
    expect(prisma.permission.upsert).not.toHaveBeenCalled();
    expect(prisma.permissionAction.upsert).not.toHaveBeenCalled();
    expect(prisma.permissionResource.findUnique).not.toHaveBeenCalled();
  });
});
