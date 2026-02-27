import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
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
import { Audit } from '../../shared/decorators/audit.decorator';
import { AuditState } from '../../shared/decorators/audit-state.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';
import { ApiDefaultErrors, ApiProtected } from '../../shared/docs/openapi';
import { KeycloakAuthGuard } from '../../shared/guards/keycloak-auth.guard';
import { RbacGuard } from '../../shared/guards/rbac.guard';
import { UserPermissions } from '../rbac/constants/permissions.constants';
import { CreateUserDto } from './dto/create-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SetUserPermissionsDto } from './dto/set-user-permissions.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { CreateUserUseCase } from './use-cases/create-user.usecase';
import { DisableUserUseCase } from './use-cases/disable-user.usecase';
import { ListAvailableUserPermissionsUseCase } from './use-cases/list-available-user-permissions.usecase';
import { ListUsersUseCase } from './use-cases/list-users.usecase';
import { ResetPasswordUseCase } from './use-cases/reset-password.usecase';
import { SetUserPermissionsUseCase } from './use-cases/set-user-permissions.usecase';
import { UpdateUserUseCase } from './use-cases/update-user.usecase';

@ApiTags('Users')
@Controller('users')
@UseGuards(KeycloakAuthGuard, RbacGuard)
export class UsersController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly disableUserUseCase: DisableUserUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
    private readonly setUserPermissionsUseCase: SetUserPermissionsUseCase,
    private readonly listAvailableUserPermissionsUseCase: ListAvailableUserPermissionsUseCase,
  ) {}

  @Post()
  @Roles(UserPermissions.CREATE)
  @Audit('user.create', 'system.user')
  @ApiProtected({
    path: '/api/v1/users',
    roles: ['user:create'],
  })
  @ApiOperation({
    summary: 'Create user',
    description:
      'Creates a new user in Keycloak and local persistence. Requires role `user:create`.',
  })
  @ApiBody({
    type: CreateUserDto,
    examples: {
      createUser: {
        summary: 'Create user payload',
        value: {
          email: 'jane.doe@blih.local',
          username: 'jane.doe',
          firstName: 'Jane',
          lastName: 'Doe',
          phone: '+12025550199',
          departmentId: '1f31a301-dfb8-4071-aab1-ad6bc4891da7',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'User created successfully.',
    type: UserResponseDto,
    schema: {
      example: {
        id: '0d9ff3b3-0a4a-42c5-a5b6-d4f809ec4374',
        keycloakId: 'ae3fdb37-c555-4b17-b320-d5f8b435f667',
        email: 'jane.doe@blih.local',
        firstName: 'Jane',
        lastName: 'Doe',
        phone: '+12025550199',
        status: 'ACTIVE',
        position: null,
        departmentId: '1f31a301-dfb8-4071-aab1-ad6bc4891da7',
        permissions: [],
        createdAt: '2026-02-15T08:52:24.144Z',
        updatedAt: '2026-02-15T08:52:24.144Z',
      },
    },
  })
  @ApiDefaultErrors({
    path: '/api/v1/users',
    badRequest: {
      message: [
        'email must be an email',
        'username can only contain letters, numbers, dots, underscores, and hyphens',
      ],
      error: 'Bad Request',
      statusCode: 400,
    },
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  createUser(@Body() dto: CreateUserDto) {
    return this.createUserUseCase.execute(dto);
  }

  @Patch(':userId')
  @Roles(UserPermissions.UPDATE)
  @Audit('user.update', 'system.user')
  @AuditState({ resourceIdKey: 'params.userId', loadBefore: true })
  @ApiProtected({
    path: '/api/v1/users/:userId',
    roles: ['user:update'],
  })
  @ApiOperation({
    summary: 'Update user',
    description:
      'Updates a user profile in Keycloak and local persistence. Requires role `user:update`.',
  })
  @ApiParam({
    name: 'userId',
    description: 'Internal user id or Keycloak user id.',
    example: '0d9ff3b3-0a4a-42c5-a5b6-d4f809ec4374',
  })
  @ApiBody({
    type: UpdateUserDto,
    examples: {
      updateUser: {
        summary: 'Update user payload',
        value: {
          firstName: 'Janet',
          position: 'Finance Manager',
          phone: '+12025550000',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'User updated successfully.',
    type: UserResponseDto,
    schema: {
      example: {
        id: '0d9ff3b3-0a4a-42c5-a5b6-d4f809ec4374',
        keycloakId: 'ae3fdb37-c555-4b17-b320-d5f8b435f667',
        email: 'jane.doe@blih.local',
        firstName: 'Janet',
        lastName: 'Doe',
        phone: '+12025550000',
        status: 'ACTIVE',
        position: 'Finance Manager',
        departmentId: '1f31a301-dfb8-4071-aab1-ad6bc4891da7',
        permissions: ['user:view'],
        createdAt: '2026-02-15T08:52:24.144Z',
        updatedAt: '2026-02-15T09:12:24.144Z',
      },
    },
  })
  @ApiDefaultErrors({
    path: '/api/v1/users/0d9ff3b3-0a4a-42c5-a5b6-d4f809ec4374',
    badRequest: {
      message: ['property unknownField should not exist'],
      error: 'Bad Request',
      statusCode: 400,
    },
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
    notFound: 'User not found',
  })
  updateUser(@Param('userId') userId: string, @Body() dto: UpdateUserDto) {
    return this.updateUserUseCase.execute(userId, dto);
  }

  @Get(':userId/permissions/available')
  @Roles(UserPermissions.ASSIGN_ROLE)
  @ApiProtected({
    path: '/api/v1/users/:userId/permissions/available',
    roles: ['user:assign-role'],
  })
  @ApiOperation({
    summary: 'List available permissions for user',
    description:
      'Returns permissions assignable to a user based on active assigned roles and role hierarchy.',
  })
  @ApiParam({
    name: 'userId',
    description: 'Internal user id or Keycloak user id.',
    example: '0d9ff3b3-0a4a-42c5-a5b6-d4f809ec4374',
  })
  @ApiOkResponse({
    description: 'Assignable permissions for user.',
    schema: {
      example: {
        userId: '0d9ff3b3-0a4a-42c5-a5b6-d4f809ec4374',
        permissions: ['invoice:view', 'invoice:approve'],
      },
    },
  })
  getAvailablePermissions(@Param('userId') userId: string) {
    return this.listAvailableUserPermissionsUseCase.execute(userId);
  }

  @Put(':userId/permissions')
  @Roles(UserPermissions.ASSIGN_ROLE)
  @Audit('user.permissions.update', 'system.user')
  @ApiProtected({
    path: '/api/v1/users/:userId/permissions',
    roles: ['user:assign-role'],
  })
  @ApiOperation({
    summary: 'Replace user permissions',
    description:
      'Replaces stored user permissions. Every permission must be assignable from the user active roles.',
  })
  @ApiParam({
    name: 'userId',
    description: 'Internal user id or Keycloak user id.',
    example: '0d9ff3b3-0a4a-42c5-a5b6-d4f809ec4374',
  })
  @ApiBody({
    type: SetUserPermissionsDto,
  })
  @ApiOkResponse({
    description: 'User permissions updated.',
    schema: {
      example: {
        userId: '0d9ff3b3-0a4a-42c5-a5b6-d4f809ec4374',
        permissions: ['invoice:view'],
      },
    },
  })
  setUserPermissions(
    @Param('userId') userId: string,
    @Body() dto: SetUserPermissionsDto,
  ) {
    return this.setUserPermissionsUseCase.execute(userId, dto.permissions);
  }

  @Delete(':userId')
  @Roles(UserPermissions.DISABLE)
  @Audit('user.disable', 'system.user')
  @AuditState({ resourceIdKey: 'params.userId', loadBefore: true })
  @ApiProtected({
    path: '/api/v1/users/:userId',
    roles: ['user:disable'],
  })
  @ApiOperation({
    summary: 'Disable user',
    description:
      'Disables a user account in Keycloak and marks the local user status as DISABLED. Requires role `user:disable`.',
  })
  @ApiParam({
    name: 'userId',
    description: 'Internal user id or Keycloak user id.',
    example: '0d9ff3b3-0a4a-42c5-a5b6-d4f809ec4374',
  })
  @ApiOkResponse({
    description: 'User disabled successfully.',
    type: UserResponseDto,
    schema: {
      example: {
        id: '0d9ff3b3-0a4a-42c5-a5b6-d4f809ec4374',
        keycloakId: 'ae3fdb37-c555-4b17-b320-d5f8b435f667',
        email: 'jane.doe@blih.local',
        firstName: 'Jane',
        lastName: 'Doe',
        phone: '+12025550199',
        status: 'DISABLED',
        position: 'Finance Manager',
        departmentId: '1f31a301-dfb8-4071-aab1-ad6bc4891da7',
        permissions: ['user:view'],
        createdAt: '2026-02-15T08:52:24.144Z',
        updatedAt: '2026-02-15T09:52:24.144Z',
      },
    },
  })
  @ApiDefaultErrors({
    path: '/api/v1/users/0d9ff3b3-0a4a-42c5-a5b6-d4f809ec4374',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
    notFound: 'User not found',
  })
  disableUser(@Param('userId') userId: string) {
    return this.disableUserUseCase.execute(userId);
  }

  @Post(':userId/reset-password')
  @Roles(UserPermissions.RESET_PASSWORD)
  @Audit('user.reset_password', 'system.user')
  @ApiProtected({
    path: '/api/v1/users/:userId/reset-password',
    roles: ['user:reset_password'],
  })
  @ApiOperation({
    summary: 'Reset user password',
    description:
      'Resets password for the target user account. Requires role `user:reset_password`.',
  })
  @ApiParam({
    name: 'userId',
    description: 'Internal user id or Keycloak user id.',
    example: '0d9ff3b3-0a4a-42c5-a5b6-d4f809ec4374',
  })
  @ApiBody({
    type: ResetPasswordDto,
    examples: {
      resetPassword: {
        summary: 'Reset password payload',
        value: {
          password: 'S3curePassw0rd!',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Password reset request accepted.',
    schema: {
      example: {
        success: true,
      },
    },
  })
  @ApiDefaultErrors({
    path: '/api/v1/users/0d9ff3b3-0a4a-42c5-a5b6-d4f809ec4374/reset-password',
    badRequest: {
      message: ['password must be longer than or equal to 8 characters'],
      error: 'Bad Request',
      statusCode: 400,
    },
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
    notFound: 'User not found',
  })
  resetPassword(
    @Param('userId') userId: string,
    @Body() payload: ResetPasswordDto,
  ) {
    return this.resetPasswordUseCase.execute(userId, payload.password);
  }

  @Get()
  @Roles(UserPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/users',
    roles: ['user:view'],
  })
  @ApiOperation({
    summary: 'List users',
    description:
      'Returns users in the configured realm sorted by most recent creation date. Requires role `user:view`.',
  })
  @ApiOkResponse({
    description: 'User list for the configured realm.',
    type: UserResponseDto,
    isArray: true,
    schema: {
      example: [
        {
          id: '0d9ff3b3-0a4a-42c5-a5b6-d4f809ec4374',
          keycloakId: 'ae3fdb37-c555-4b17-b320-d5f8b435f667',
          email: 'jane.doe@blih.local',
          firstName: 'Jane',
          lastName: 'Doe',
          phone: '+12025550199',
          status: 'ACTIVE',
          position: 'Finance Manager',
          departmentId: '1f31a301-dfb8-4071-aab1-ad6bc4891da7',
          permissions: ['user:view'],
          createdAt: '2026-02-15T08:52:24.144Z',
          updatedAt: '2026-02-15T09:12:24.144Z',
        },
      ],
    },
  })
  @ApiDefaultErrors({
    path: '/api/v1/users',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  listUsers() {
    return this.listUsersUseCase.execute();
  }
}
