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
      expect(getRoles(ResourcesController, 'createResource')).toEqual([
        SystemResourcePermissions.CREATE,
      ]);
      expect(getRoles(ResourcesController, 'listResources')).toEqual([
        SystemResourcePermissions.VIEW,
      ]);
      expect(getRoles(ResourcesController, 'getResource')).toEqual([
        SystemResourcePermissions.VIEW,
      ]);
      expect(getRoles(ResourcesController, 'updateResource')).toEqual([
        SystemResourcePermissions.UPDATE,
      ]);
      expect(getRoles(ResourcesController, 'deleteResource')).toEqual([
        SystemResourcePermissions.DELETE,
      ]);
    });
  });

  describe('ActionsController', () => {
    it('sets expected role metadata on action endpoints', () => {
      expect(getRoles(ActionsController, 'createAction')).toEqual([
        SystemPermissionPermissions.CREATE,
      ]);
      expect(getRoles(ActionsController, 'listActions')).toEqual([
        SystemPermissionPermissions.VIEW,
      ]);
      expect(getRoles(ActionsController, 'getAction')).toEqual([
        SystemPermissionPermissions.VIEW,
      ]);
      expect(getRoles(ActionsController, 'updateAction')).toEqual([
        SystemPermissionPermissions.UPDATE,
      ]);
      expect(getRoles(ActionsController, 'deleteAction')).toEqual([
        SystemPermissionPermissions.DELETE,
      ]);
    });
  });

  describe('PermissionsController', () => {
    it('sets expected role metadata on permission endpoints', () => {
      expect(getRoles(PermissionsController, 'createPermission')).toEqual([
        SystemPermissionPermissions.CREATE,
      ]);
      expect(getRoles(PermissionsController, 'listPermissions')).toEqual([
        SystemPermissionPermissions.VIEW,
      ]);
      expect(getRoles(PermissionsController, 'getPermission')).toEqual([
        SystemPermissionPermissions.VIEW,
      ]);
      expect(getRoles(PermissionsController, 'updatePermission')).toEqual([
        SystemPermissionPermissions.UPDATE,
      ]);
      expect(getRoles(PermissionsController, 'deletePermission')).toEqual([
        SystemPermissionPermissions.DELETE,
      ]);
    });
  });
});
