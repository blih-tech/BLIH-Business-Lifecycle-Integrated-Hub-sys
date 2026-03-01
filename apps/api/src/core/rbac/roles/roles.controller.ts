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
import { ResponseMessage } from '../../../shared/decorators/response-message.decorator';
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
      'Creates a role in Keycloak and upserts its metadata in local persistence. If the role already exists in Keycloak, the local metadata is synchronized.',
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
    description: 'Role created or synchronized successfully.',
    schema: {
      example: {
        id: '57e883d0-d0c0-4187-a232-50fa729f6876',
        name: 'finance.approver',
        displayName: 'Finance Approver',
        description: 'Can approve invoices in assigned organization.',
        isSystem: false,
        parentRoleId: '57e883d0-d0c0-4187-a232-50fa729f6876',
        createdAt: '2026-02-21T18:00:00.000Z',
        updatedAt: '2026-02-21T18:00:00.000Z',
      },
    },
  })
  @ApiDefaultErrors({
    path: '/api/v1/rbac/roles',
    badRequest: 'Parent role not found or the request payload is invalid',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  @ResponseMessage('Role created successfully')
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
      'Lists roles with optional pagination, search, and system-role filtering.',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({ name: 'search', required: false, example: 'finance' })
  @ApiQuery({ name: 'isSystem', required: false, example: false })
  @ApiOkResponse({
    description: 'Role list with pagination metadata.',
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
  @ResponseMessage('Roles retrieved successfully')
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
  @ResponseMessage('Role retrieved successfully')
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
    description: 'Updates mutable role metadata. System roles are read-only.',
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
    description: 'Updated role metadata.',
    schema: {
      example: {
        id: '57e883d0-d0c0-4187-a232-50fa729f6876',
        name: 'finance.approver',
        displayName: 'Finance Approver',
        description: 'Approves finance documents.',
        isSystem: false,
        parentRoleId: null,
        createdAt: '2026-02-21T18:00:00.000Z',
        updatedAt: '2026-02-21T19:00:00.000Z',
      },
    },
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
  @ResponseMessage('Role updated successfully')
  updateRole(@Param('roleName') roleName: string, @Body() dto: UpdateRoleDto) {
    return this.updateRoleUseCase.execute(roleName, dto);
  }

  @Post('roles/:roleId/permissions')
  @Roles(SystemRolePermissions.UPDATE)
  @Audit('role.permission.add', 'system.rbac')
  @ApiOperation({ summary: 'Add role permissions' })
  @ApiOkResponse({
    description: 'Role permissions added successfully.',
    schema: {
      example: {
        success: true,
        roleId: '57e883d0-d0c0-4187-a232-50fa729f6876',
      },
    },
  })
  @ResponseMessage('Role permissions added successfully')
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
  @ApiOkResponse({
    description: 'Requested permissions removed from the role.',
    schema: {
      example: {
        success: true,
        roleId: '57e883d0-d0c0-4187-a232-50fa729f6876',
      },
    },
  })
  @ResponseMessage('Role permissions removed successfully')
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
  @ApiOkResponse({
    description: 'Role permissions replaced successfully.',
    schema: {
      example: {
        success: true,
        roleId: '57e883d0-d0c0-4187-a232-50fa729f6876',
      },
    },
  })
  @ResponseMessage('Role permissions replaced successfully')
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
  @ResponseMessage('Role deleted successfully')
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
      'Assigns a role to a user and optionally records assignment metadata such as assignee and expiration.',
  })
  @ApiBody({
    type: AssignRoleDto,
    examples: {
      assignRole: {
        summary: 'Assign role payload',
        value: {
          userId: '0d9ff3b3-0a4a-42c5-a5b6-d4f809ec4374',
          roleName: 'finance.approver',
          assignedBy: '40b5c2fb-7a2f-4af2-ac03-fad1bb3fe061',
          expiresAt: '2026-12-31T23:59:59.000Z',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Role assignment persisted successfully.',
    schema: {
      example: {
        id: '487cd033-4744-4fc7-bd7c-1f31aa0df74b',
        userId: '0d9ff3b3-0a4a-42c5-a5b6-d4f809ec4374',
        roleId: '57e883d0-d0c0-4187-a232-50fa729f6876',
        assignedBy: '40b5c2fb-7a2f-4af2-ac03-fad1bb3fe061',
        expiresAt: '2026-12-31T23:59:59.000Z',
        createdAt: '2026-02-21T19:15:00.000Z',
        updatedAt: '2026-02-21T19:15:00.000Z',
      },
    },
  })
  @ApiDefaultErrors({
    path: '/api/v1/rbac/roles/assign',
    badRequest: 'Invalid expiresAt value',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
    notFound: 'User or role not found',
  })
  @ResponseMessage('Role assigned successfully')
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
      'Revokes a role assignment from a user and removes the Keycloak realm role when no assignments remain.',
  })
  @ApiBody({
    type: AssignRoleDto,
    examples: {
      revokeRole: {
        summary: 'Revoke role payload',
        value: {
          userId: '0d9ff3b3-0a4a-42c5-a5b6-d4f809ec4374',
          roleName: 'finance.approver',
        },
      },
    },
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
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
    notFound: 'User or role not found, or the role assignment does not exist',
  })
  @ResponseMessage('Role revoked successfully')
  revokeRole(@Body() dto: AssignRoleDto) {
    return this.revokeRoleUseCase.execute(dto);
  }
}
