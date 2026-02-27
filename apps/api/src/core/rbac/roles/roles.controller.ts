import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Audit } from '../../../shared/decorators/audit.decorator';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { ApiDefaultErrors, ApiProtected } from '../../../shared/docs/openapi';
import { KeycloakAuthGuard } from '../../../shared/guards/keycloak-auth.guard';
import { RbacGuard } from '../../../shared/guards/rbac.guard';
import { SystemRolePermissions } from '../constants/permissions.constants';
import { AssignRoleDto } from './dto/assign-role.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { ListRolesQueryDto } from './dto/list-roles-query.dto';
import { RolePermissionAssignmentDto } from './dto/role-permission-assignment.dto';
import { RoleResponseDto } from './dto/role-response.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AddRolePermissionsUseCase } from './usecases/add-role-permissions.usecase';
import { AssignRoleUseCase } from './usecases/assign-role.usecase';
import { CreateRoleUseCase } from './usecases/create-role.usecase';
import { DeleteRoleUseCase } from './usecases/delete-role.usecase';
import { GetRoleUseCase } from './usecases/get-role.usecase';
import { ListRolesUseCase } from './usecases/list-roles.usecase';
import { RemoveRolePermissionsUseCase } from './usecases/remove-role-permissions.usecase';
import { ReplaceRolePermissionsUseCase } from './usecases/replace-role-permissions.usecase';
import { RevokeRoleUseCase } from './usecases/revoke-role.usecase';
import { UpdateRoleUseCase } from './usecases/update-role.usecase';

@ApiTags('RBAC')
@Controller('rbac')
@UseGuards(KeycloakAuthGuard, RbacGuard)
export class RolesController {
  constructor(
    private readonly createRoleUseCase: CreateRoleUseCase,
    private readonly listRolesUseCase: ListRolesUseCase,
    private readonly getRoleUseCase: GetRoleUseCase,
    private readonly updateRoleUseCase: UpdateRoleUseCase,
    private readonly deleteRoleUseCase: DeleteRoleUseCase,
    private readonly addRolePermissionsUseCase: AddRolePermissionsUseCase,
    private readonly removeRolePermissionsUseCase: RemoveRolePermissionsUseCase,
    private readonly replaceRolePermissionsUseCase: ReplaceRolePermissionsUseCase,
    private readonly assignRoleUseCase: AssignRoleUseCase,
    private readonly revokeRoleUseCase: RevokeRoleUseCase,
  ) {}

  @Post('roles')
  @Roles(SystemRolePermissions.CREATE)
  @Audit('role.create', 'system.rbac')
  @ApiProtected({
    path: '/api/v1/rbac/roles',
    roles: [SystemRolePermissions.CREATE],
  })
  @ApiOperation({
    summary: 'Create role',
    description:
      'Creates or updates a role in Keycloak and local persistence, and optionally binds permissions. Requires permission `system_role:create`.',
  })
  @ApiBody({
    type: CreateRoleDto,
    examples: {
      createRole: {
        summary: 'Create role payload',
        value: {
          name: 'finance.approver',
          displayName: 'Finance Approver',
          description: 'Can approve invoices in assigned organization.',
          parentRoleId: '57e883d0-d0c0-4187-a232-50fa729f6876',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Role created/updated successfully.',
  })
  @ApiDefaultErrors({
    path: '/api/v1/rbac/roles',
    badRequest: {
      message: [
        'permission must match /^[a-z0-9_]+:[a-z0-9_*-]+$/ regular expression',
      ],
      error: 'Bad Request',
      statusCode: 400,
    },
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  createRole(@Body() dto: CreateRoleDto) {
    return this.createRoleUseCase.execute(dto);
  }

  @Get('roles')
  @Roles(SystemRolePermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/rbac/roles',
    roles: [SystemRolePermissions.VIEW],
  })
  @ApiOperation({
    summary: 'List roles',
    description:
      'Lists roles with optional pagination and filters. Requires permission `system_role:view`.',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({ name: 'search', required: false, example: 'finance' })
  @ApiQuery({ name: 'isSystem', required: false, example: false })
  @ApiOkResponse({
    description: 'Paginated role list.',
    schema: {
      example: {
        items: [
          {
            id: '57e883d0-d0c0-4187-a232-50fa729f6876',
            name: 'finance.approver',
            displayName: 'Finance Approver',
            description: 'Approves finance documents.',
            isSystem: false,
            parentRoleId: '57e883d0-d0c0-4187-a232-50fa729f6876',
            permissions: ['invoice:approve'],
            assignmentCount: 4,
            createdAt: '2026-02-21T18:00:00.000Z',
            updatedAt: '2026-02-21T18:00:00.000Z',
          },
        ],
        page: 1,
        limit: 20,
        total: 1,
      },
    },
  })
  @ApiDefaultErrors({
    path: '/api/v1/rbac/roles',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  listRoles(@Query() query: ListRolesQueryDto) {
    return this.listRolesUseCase.execute(query);
  }

  @Get('roles/:roleName')
  @Roles(SystemRolePermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/rbac/roles/:roleName',
    roles: [SystemRolePermissions.VIEW],
  })
  @ApiOperation({
    summary: 'Get role',
    description: 'Returns role details by role name.',
  })
  @ApiParam({
    name: 'roleName',
    description: 'Role machine name.',
    example: 'finance.approver',
  })
  @ApiOkResponse({
    description: 'Role details.',
    type: RoleResponseDto,
  })
  @ApiDefaultErrors({
    path: '/api/v1/rbac/roles/finance.approver',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
    notFound: 'Role not found',
  })
  getRole(@Param('roleName') roleName: string) {
    return this.getRoleUseCase.execute(roleName);
  }

  @Put('roles/:roleName')
  @Roles(SystemRolePermissions.UPDATE)
  @Audit('role.update', 'system.rbac')
  @ApiProtected({
    path: '/api/v1/rbac/roles/:roleName',
    roles: [SystemRolePermissions.UPDATE],
  })
  @ApiOperation({
    summary: 'Update role',
    description:
      'Updates mutable role fields and permission bindings. System roles are read-only.',
  })
  @ApiParam({
    name: 'roleName',
    description: 'Role machine name.',
    example: 'finance.approver',
  })
  @ApiBody({
    type: UpdateRoleDto,
  })
  @ApiOkResponse({
    description: 'Updated role.',
    type: RoleResponseDto,
  })
  @ApiDefaultErrors({
    path: '/api/v1/rbac/roles/finance.approver',
    badRequest: {
      message: 'At least one field must be provided',
    },
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'System roles are read-only',
    notFound: 'Role not found',
  })
  updateRole(@Param('roleName') roleName: string, @Body() dto: UpdateRoleDto) {
    return this.updateRoleUseCase.execute(roleName, dto);
  }

  @Post('roles/:roleId/permissions')
  @Roles(SystemRolePermissions.UPDATE)
  @Audit('role.permission.add', 'system.rbac')
  @ApiOperation({ summary: 'Add role permissions' })
  addRolePermissions(
    @Param('roleId') roleId: string,
    @Body() dto: RolePermissionAssignmentDto,
  ) {
    return this.addRolePermissionsUseCase.execute(roleId, dto.permissionIds);
  }

  @Delete('roles/:roleId/permissions')
  @Roles(SystemRolePermissions.UPDATE)
  @Audit('role.permission.remove', 'system.rbac')
  @ApiOperation({ summary: 'Remove role permissions' })
  removeRolePermissions(
    @Param('roleId') roleId: string,
    @Body() dto: RolePermissionAssignmentDto,
  ) {
    return this.removeRolePermissionsUseCase.execute(roleId, dto.permissionIds);
  }

  @Put('roles/:roleId/permissions')
  @Roles(SystemRolePermissions.UPDATE)
  @Audit('role.permission.replace', 'system.rbac')
  @ApiOperation({ summary: 'Replace role permissions' })
  replaceRolePermissions(
    @Param('roleId') roleId: string,
    @Body() dto: RolePermissionAssignmentDto,
  ) {
    return this.replaceRolePermissionsUseCase.execute(
      roleId,
      dto.permissionIds,
    );
  }

  @Delete('roles/:roleName')
  @Roles(SystemRolePermissions.DELETE)
  @Audit('role.delete', 'system.rbac')
  @ApiProtected({
    path: '/api/v1/rbac/roles/:roleName',
    roles: [SystemRolePermissions.DELETE],
  })
  @ApiOperation({
    summary: 'Delete role',
    description:
      'Deletes a role when it has no active assignments. System roles are read-only.',
  })
  @ApiParam({
    name: 'roleName',
    description: 'Role machine name.',
    example: 'finance.approver',
  })
  @ApiOkResponse({
    description: 'Role deletion status.',
    schema: {
      example: { success: true, deletedRole: 'finance.approver' },
    },
  })
  @ApiDefaultErrors({
    path: '/api/v1/rbac/roles/finance.approver',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'System roles are read-only',
    notFound: 'Role not found',
    badRequest: {
      message: 'Cannot delete role with active assignments',
    },
  })
  deleteRole(@Param('roleName') roleName: string) {
    return this.deleteRoleUseCase.execute(roleName);
  }

  @Post('roles/assign')
  @Roles(SystemRolePermissions.ASSIGN)
  @Audit('role.assign', 'system.rbac')
  @ApiProtected({
    path: '/api/v1/rbac/roles/assign',
    roles: [SystemRolePermissions.ASSIGN],
  })
  @ApiOperation({
    summary: 'Assign role',
    description:
      'Assigns a role to a user with optional organization/department scope and expiration. Requires permission `system_role:assign`.',
  })
  @ApiBody({
    type: AssignRoleDto,
  })
  @ApiOkResponse({
    description: 'Role assignment persisted successfully.',
  })
  @ApiDefaultErrors({
    path: '/api/v1/rbac/roles/assign',
    badRequest: {
      message: 'organizationId is required for organization-scoped roles',
    },
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
    notFound: 'User or role not found',
  })
  assignRole(@Body() dto: AssignRoleDto) {
    return this.assignRoleUseCase.execute(dto);
  }

  @Post('roles/revoke')
  @Roles(SystemRolePermissions.REVOKE)
  @Audit('role.revoke', 'system.rbac')
  @ApiProtected({
    path: '/api/v1/rbac/roles/revoke',
    roles: [SystemRolePermissions.REVOKE],
  })
  @ApiOperation({
    summary: 'Revoke role',
    description:
      'Revokes a scoped role assignment from a user. Requires permission `system_role:revoke`.',
  })
  @ApiBody({
    type: AssignRoleDto,
  })
  @ApiOkResponse({
    description: 'Role assignment revoked successfully.',
    schema: {
      example: {
        success: true,
      },
    },
  })
  @ApiDefaultErrors({
    path: '/api/v1/rbac/roles/revoke',
    badRequest: {
      message: 'organizationId is required for organization-scoped revocation',
    },
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
    notFound: 'Scoped role assignment not found',
  })
  revokeRole(@Body() dto: AssignRoleDto) {
    return this.revokeRoleUseCase.execute(dto);
  }
}
