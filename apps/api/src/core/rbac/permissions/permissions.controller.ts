import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { ApiDefaultErrors, ApiProtected } from '../../../shared/docs/openapi';
import { KeycloakAuthGuard } from '../../../shared/guards/keycloak-auth.guard';
import { RbacGuard } from '../../../shared/guards/rbac.guard';
import { SystemPermissionPermissions } from '../constants/permissions.constants';
import { GetPermissionUseCase } from './usecases/get-permission.usecase';
import { ListPermissionsUseCase } from './usecases/list-permissions.usecase';

@ApiTags('RBAC')
@Controller('rbac')
@UseGuards(KeycloakAuthGuard, RbacGuard)
export class PermissionsController {
  constructor(
    private readonly listPermissionsUseCase: ListPermissionsUseCase,
    private readonly getPermissionUseCase: GetPermissionUseCase,
  ) {}

  @Get('permissions')
  @Roles(SystemPermissionPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/rbac/permissions',
    roles: [SystemPermissionPermissions.VIEW],
  })
  @ApiOperation({
    summary: 'List permissions',
    description: 'Lists seeded RBAC permissions (`resource:action`).',
  })
  @ApiOkResponse({
    description: 'Permissions.',
  })
  @ApiDefaultErrors({
    path: '/api/v1/rbac/permissions',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  listPermissions() {
    return this.listPermissionsUseCase.execute();
  }

  @Get('permissions/:permissionId')
  @Roles(SystemPermissionPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/rbac/permissions/:permissionId',
    roles: [SystemPermissionPermissions.VIEW],
  })
  @ApiOperation({
    summary: 'Get permission',
    description: 'Returns a single seeded permission by id.',
  })
  @ApiParam({
    name: 'permissionId',
    description: 'Permission id.',
    example: '298bad72-4cce-491a-bb04-58dc9ac36b61',
  })
  @ApiOkResponse({
    description: 'Permission.',
  })
  @ApiDefaultErrors({
    path: '/api/v1/rbac/permissions/298bad72-4cce-491a-bb04-58dc9ac36b61',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
    notFound: 'Permission not found',
  })
  getPermission(@Param('permissionId') permissionId: string) {
    return this.getPermissionUseCase.execute(permissionId);
  }
}
