import { ROLES_KEY } from '../../shared/decorators/roles.decorator';
import {
  SystemPermissionPermissions,
  SystemResourcePermissions,
  SystemRolePermissions,
} from './constants/permissions.constants';
import { RolesController } from './roles/roles.controller';
import { PermissionsController } from './permissions/permissions.controller';
import { ResourcesController } from './resources/resources.controller';
import { ActionsController } from './actions/actions.controller';

const getRoles = (
  controller: { prototype: object },
  methodName: string,
): string[] | undefined => {
  const descriptor = Object.getOwnPropertyDescriptor(
    controller.prototype,
    methodName,
  );
  const method = descriptor?.value as object | undefined;
  return method
    ? (Reflect.getMetadata(ROLES_KEY, method) as string[])
    : undefined;
};

describe('RBAC Controllers', () => {
  describe('RolesController', () => {
    it('sets expected role metadata on role endpoints', () => {
      expect(getRoles(RolesController, 'createRole')).toEqual([
        SystemRolePermissions.CREATE,
      ]);
      expect(getRoles(RolesController, 'assignRole')).toEqual([
        SystemRolePermissions.ASSIGN,
      ]);
      expect(getRoles(RolesController, 'revokeRole')).toEqual([
        SystemRolePermissions.REVOKE,
      ]);
      expect(getRoles(RolesController, 'listRoles')).toEqual([
        SystemRolePermissions.VIEW,
      ]);
      expect(getRoles(RolesController, 'getRole')).toEqual([
        SystemRolePermissions.VIEW,
      ]);
      expect(getRoles(RolesController, 'updateRole')).toEqual([
        SystemRolePermissions.UPDATE,
      ]);
      expect(getRoles(RolesController, 'deleteRole')).toEqual([
        SystemRolePermissions.DELETE,
      ]);
    });
  });

  describe('ResourcesController', () => {
    it('sets expected role metadata on resource endpoints', () => {
      expect(getRoles(ResourcesController, 'listResources')).toEqual([
        SystemResourcePermissions.VIEW,
      ]);
      expect(getRoles(ResourcesController, 'getResource')).toEqual([
        SystemResourcePermissions.VIEW,
      ]);
    });
  });

  describe('ActionsController', () => {
    it('sets expected role metadata on action endpoints', () => {
      expect(getRoles(ActionsController, 'listActions')).toEqual([
        SystemPermissionPermissions.VIEW,
      ]);
      expect(getRoles(ActionsController, 'getAction')).toEqual([
        SystemPermissionPermissions.VIEW,
      ]);
    });
  });

  describe('PermissionsController', () => {
    it('sets expected role metadata on permission endpoints', () => {
      expect(getRoles(PermissionsController, 'listPermissions')).toEqual([
        SystemPermissionPermissions.VIEW,
      ]);
      expect(getRoles(PermissionsController, 'getPermission')).toEqual([
        SystemPermissionPermissions.VIEW,
      ]);
    });
  });

  it('does not expose removed catalog mutation handlers', () => {
    const rolesProto = RolesController.prototype;
    expect('createResource' in rolesProto).toBe(false);
    expect('updateResource' in rolesProto).toBe(false);
    expect('deleteResource' in rolesProto).toBe(false);

    const actionsProto = ActionsController.prototype;
    expect('createAction' in actionsProto).toBe(false);
    expect('updateAction' in actionsProto).toBe(false);
    expect('deleteAction' in actionsProto).toBe(false);

    const permissionsProto = PermissionsController.prototype;
    expect('createPermission' in permissionsProto).toBe(false);
    expect('updatePermission' in permissionsProto).toBe(false);
    expect('deletePermission' in permissionsProto).toBe(false);
  });
});
