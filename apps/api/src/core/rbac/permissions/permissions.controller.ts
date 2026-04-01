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
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { ResponseMessage } from '../../../shared/decorators/response-message.decorator';
import { ApiDefaultErrors, ApiProtected } from '../../../shared/docs/openapi';
import { KeycloakAuthGuard } from '../../../shared/guards/keycloak-auth.guard';
import { RbacGuard } from '../../../shared/guards/rbac.guard';
import { SystemPermissionPermissions } from '@repo/types/rbac';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { PermissionResponseDto } from './dto/permission-response.dto';
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

  @Post('permissions')
  @Roles(SystemPermissionPermissions.CREATE)
  @ApiProtected({
    path: '/api/v1/rbac/permissions',
    roles: [SystemPermissionPermissions.CREATE],
  })
  @ApiOperation({
    summary: 'Create permission',
    description:
      'Creates a permission by combining an existing resource and action into a `resource:action` slug.',
  })
  @ApiBody({
    type: CreatePermissionDto,
    examples: {
      createPermission: {
        summary: 'Create permission payload',
        value: {
          resourceId: '1f24cdb6-f4e4-4d2a-b991-a82af2019d64',
          actionId: '65a7eb9a-8803-4f20-b649-0886c4dceef8',
          description: 'Approve invoice records.',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Permission created successfully.',
    schema: {
      example: {
        id: '298bad72-4cce-491a-bb04-58dc9ac36b61',
        resourceId: '1f24cdb6-f4e4-4d2a-b991-a82af2019d64',
        actionId: '65a7eb9a-8803-4f20-b649-0886c4dceef8',
        slug: 'invoice:approve',
        description: 'Approve invoice records.',
        createdAt: '2026-02-20T16:00:00.000Z',
      },
    },
  })
  @ApiDefaultErrors({
    path: '/api/v1/rbac/permissions',
    badRequest: 'Invalid resourceId, invalid actionId, or duplicate permission',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  @ResponseMessage('Permission created successfully')
  createPermission(@Body() dto: CreatePermissionDto) {
    return this.createPermissionUseCase.execute(dto);
  }

  @Get('permissions')
  @Roles(SystemPermissionPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/rbac/permissions',
    roles: [SystemPermissionPermissions.VIEW],
  })
  @ApiOperation({
    summary: 'List permissions',
    description:
      'Returns permission slugs with their linked resource and action names.',
  })
  @ApiOkResponse({
    description: 'Permissions sorted by slug.',
    type: PermissionResponseDto,
    isArray: true,
  })
  @ApiDefaultErrors({
    path: '/api/v1/rbac/permissions',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  @ResponseMessage('Permissions retrieved successfully')
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
    description: 'Returns a single permission by its identifier.',
  })
  @ApiParam({
    name: 'permissionId',
    description: 'Permission id.',
    example: '298bad72-4cce-491a-bb04-58dc9ac36b61',
  })
  @ApiOkResponse({
    description: 'Permission details.',
    type: PermissionResponseDto,
  })
  @ApiDefaultErrors({
    path: '/api/v1/rbac/permissions/298bad72-4cce-491a-bb04-58dc9ac36b61',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
    notFound: 'Permission not found',
  })
  @ResponseMessage('Permission retrieved successfully')
  getPermission(@Param('permissionId') permissionId: string) {
    return this.getPermissionUseCase.execute(permissionId);
  }

  @Put('permissions/:permissionId')
  @Roles(SystemPermissionPermissions.UPDATE)
  @ApiProtected({
    path: '/api/v1/rbac/permissions/:permissionId',
    roles: [SystemPermissionPermissions.UPDATE],
  })
  @ApiOperation({
    summary: 'Update permission',
    description:
      'Updates the description of an existing permission. The linked resource and action remain unchanged.',
  })
  @ApiParam({
    name: 'permissionId',
    description: 'Permission identifier.',
    example: '298bad72-4cce-491a-bb04-58dc9ac36b61',
  })
  @ApiBody({
    type: UpdatePermissionDto,
    examples: {
      updatePermission: {
        summary: 'Update permission payload',
        value: {
          description: 'Approve posted invoice records.',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Permission updated successfully.',
    schema: {
      example: {
        id: '298bad72-4cce-491a-bb04-58dc9ac36b61',
        resourceId: '1f24cdb6-f4e4-4d2a-b991-a82af2019d64',
        actionId: '65a7eb9a-8803-4f20-b649-0886c4dceef8',
        slug: 'invoice:approve',
        description: 'Approve posted invoice records.',
        createdAt: '2026-02-20T16:00:00.000Z',
      },
    },
  })
  @ApiDefaultErrors({
    path: '/api/v1/rbac/permissions/298bad72-4cce-491a-bb04-58dc9ac36b61',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
    notFound: 'Permission not found',
  })
  @ResponseMessage('Permission updated successfully')
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
    description: 'Deletes a permission by its identifier.',
  })
  @ApiParam({
    name: 'permissionId',
    description: 'Permission identifier.',
    example: '298bad72-4cce-491a-bb04-58dc9ac36b61',
  })
  @ApiOkResponse({
    description: 'Permission deletion status.',
    schema: {
      example: {
        success: true,
      },
    },
  })
  @ApiDefaultErrors({
    path: '/api/v1/rbac/permissions/298bad72-4cce-491a-bb04-58dc9ac36b61',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
    notFound: 'Permission not found',
  })
  @ResponseMessage('Permission deleted successfully')
  deletePermission(@Param('permissionId') permissionId: string) {
    return this.deletePermissionUseCase.execute(permissionId);
  }
}
