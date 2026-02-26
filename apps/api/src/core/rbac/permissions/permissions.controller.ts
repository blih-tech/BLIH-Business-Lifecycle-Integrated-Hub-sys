import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
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
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { CreatePermissionUseCase } from './usecases/create-permission.usecase';
import { DeletePermissionUseCase } from './usecases/delete-permission.usecase';
import { GetPermissionUseCase } from './usecases/get-permission.usecase';
import { ListPermissionsUseCase } from './usecases/list-permissions.usecase';
import { UpdatePermissionUseCase } from './usecases/update-permission.usecase';

@ApiTags('RBAC')
@Controller('rbac')
@UseGuards(KeycloakAuthGuard, RbacGuard)
export class PermissionsController {
  constructor(
    private readonly listPermissionsUseCase: ListPermissionsUseCase,
    private readonly getPermissionUseCase: GetPermissionUseCase,
    private readonly createPermissionUseCase: CreatePermissionUseCase,
    private readonly updatePermissionUseCase: UpdatePermissionUseCase,
    private readonly deletePermissionUseCase: DeletePermissionUseCase,
  ) {}

  @Get('permissions')
  @Roles(SystemPermissionPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/rbac/permissions',
    roles: [SystemPermissionPermissions.VIEW],
  })
  @ApiOperation({
    summary: 'List permissions',
    description: 'Lists RBAC permissions (`resource:action`).',
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
    description: 'Returns a single permission by id.',
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

  @Post('permissions')
  @Roles(SystemPermissionPermissions.CREATE)
  @ApiProtected({
    path: '/api/v1/rbac/permissions',
    roles: [SystemPermissionPermissions.CREATE],
  })
  @ApiOperation({
    summary: 'Create permission',
    description:
      'Creates permission from resourceId + actionId. Slug is generated as resource:action and is immutable.',
  })
  @ApiBody({ type: CreatePermissionDto })
  createPermission(@Body() dto: CreatePermissionDto) {
    return this.createPermissionUseCase.execute(dto);
  }

  @Put('permissions/:permissionId')
  @Roles(SystemPermissionPermissions.UPDATE)
  @ApiProtected({
    path: '/api/v1/rbac/permissions/:permissionId',
    roles: [SystemPermissionPermissions.UPDATE],
  })
  @ApiOperation({
    summary: 'Update permission',
    description: 'Updates permission description only. Slug is immutable.',
  })
  @ApiParam({
    name: 'permissionId',
    description: 'Permission id.',
    example: '298bad72-4cce-491a-bb04-58dc9ac36b61',
  })
  @ApiBody({ type: UpdatePermissionDto })
  updatePermission(
    @Param('permissionId') permissionId: string,
    @Body() dto: UpdatePermissionDto,
  ) {
    return this.updatePermissionUseCase.execute(permissionId, dto);
  }

  @Delete('permissions/:permissionId')
  @Roles(SystemPermissionPermissions.DELETE)
  @ApiProtected({
    path: '/api/v1/rbac/permissions/:permissionId',
    roles: [SystemPermissionPermissions.DELETE],
  })
  @ApiOperation({
    summary: 'Delete permission',
    description:
      'Deletes permission and cascades dependent RolePermission/UserPermissionOverride records.',
  })
  @ApiParam({
    name: 'permissionId',
    description: 'Permission id.',
    example: '298bad72-4cce-491a-bb04-58dc9ac36b61',
  })
  deletePermission(@Param('permissionId') permissionId: string) {
    return this.deletePermissionUseCase.execute(permissionId);
  }
}
