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
import { Roles } from '../../shared/decorators/roles.decorator';
import { ResponseMessage } from '../../shared/decorators/response-message.decorator';
import { ApiDefaultErrors, ApiProtected } from '../../shared/docs/openapi';
import { KeycloakAuthGuard } from '../../shared/guards/keycloak-auth.guard';
import { RbacGuard } from '../../shared/guards/rbac.guard';
import {
  UserCompensationPermissions,
  UserEmploymentPermissions,
  UserLifecyclePermissions,
  UserProfilePermissions,
} from '@repo/types/rbac';
import { CreateCompensationHistoryDto } from './dto/create-compensation-history.dto';
import { CreateCompensationComponentDto } from './dto/create-compensation-component.dto';
import { CompensationComponentResponseDto } from './dto/compensation-component-response.dto';
import { UpdateUserCompensationDto } from './dto/update-user-compensation.dto';
import { UpdateCompensationComponentDto } from './dto/update-compensation-component.dto';
import { UpdateUserEmploymentDto } from './dto/update-user-employment.dto';
import { UpdateUserLifecycleDto } from './dto/update-user-lifecycle.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { UserCompensationHistoryResponseDto } from './dto/user-compensation-history-response.dto';
import { UserCompensationResponseDto } from './dto/user-compensation-response.dto';
import { UserEmploymentResponseDto } from './dto/user-employment-response.dto';
import { UserLifecycleResponseDto } from './dto/user-lifecycle-response.dto';
import { UserProfileResponseDto } from './dto/user-profile-response.dto';
import { CreateUserCompensationHistoryUseCase } from './use-cases/create-user-compensation-history.usecase';
import { CreateCompensationComponentUseCase } from './use-cases/create-compensation-component.usecase';
import { DeleteCompensationComponentUseCase } from './use-cases/delete-compensation-component.usecase';
import { GetUserCompensationUseCase } from './use-cases/get-user-compensation.usecase';
import { GetUserEmploymentUseCase } from './use-cases/get-user-employment.usecase';
import { GetUserLifecycleUseCase } from './use-cases/get-user-lifecycle.usecase';
import { GetUserProfileUseCase } from './use-cases/get-user-profile.usecase';
import { ListCompensationComponentsUseCase } from './use-cases/list-compensation-components.usecase';
import { ListUserCompensationHistoryUseCase } from './use-cases/list-user-compensation-history.usecase';
import { UpdateCompensationComponentUseCase } from './use-cases/update-compensation-component.usecase';
import { UpdateUserCompensationUseCase } from './use-cases/update-user-compensation.usecase';
import { UpdateUserEmploymentUseCase } from './use-cases/update-user-employment.usecase';
import { UpdateUserLifecycleUseCase } from './use-cases/update-user-lifecycle.usecase';
import { UpdateUserProfileUseCase } from './use-cases/update-user-profile.usecase';

@ApiTags('Users')
@Controller('users/:userId')
@UseGuards(KeycloakAuthGuard, RbacGuard)
export class UserProfileController {
  constructor(
    private readonly getUserProfileUseCase: GetUserProfileUseCase,
    private readonly updateUserProfileUseCase: UpdateUserProfileUseCase,
    private readonly getUserEmploymentUseCase: GetUserEmploymentUseCase,
    private readonly updateUserEmploymentUseCase: UpdateUserEmploymentUseCase,
    private readonly getUserCompensationUseCase: GetUserCompensationUseCase,
    private readonly updateUserCompensationUseCase: UpdateUserCompensationUseCase,
    private readonly listCompensationComponentsUseCase: ListCompensationComponentsUseCase,
    private readonly createCompensationComponentUseCase: CreateCompensationComponentUseCase,
    private readonly updateCompensationComponentUseCase: UpdateCompensationComponentUseCase,
    private readonly deleteCompensationComponentUseCase: DeleteCompensationComponentUseCase,
    private readonly listUserCompensationHistoryUseCase: ListUserCompensationHistoryUseCase,
    private readonly createUserCompensationHistoryUseCase: CreateUserCompensationHistoryUseCase,
    private readonly getUserLifecycleUseCase: GetUserLifecycleUseCase,
    private readonly updateUserLifecycleUseCase: UpdateUserLifecycleUseCase,
  ) {}

  @Get('profile')
  @Roles(UserProfilePermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/users/:userId/profile',
    roles: [UserProfilePermissions.VIEW],
  })
  @ApiOperation({ summary: 'Get user profile' })
  @ApiParam({
    name: 'userId',
    description: 'Internal user id or Keycloak subject identifier.',
    example: '0d9ff3b3-0a4a-42c5-a5b6-d4f809ec4374',
  })
  @ApiOkResponse({ type: UserProfileResponseDto })
  @ApiDefaultErrors({
    path: '/api/v1/users/:userId/profile',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
    notFound: 'User not found',
  })
  @ResponseMessage('User profile retrieved successfully')
  getProfile(@Param('userId') userId: string) {
    return this.getUserProfileUseCase.execute(userId);
  }

  @Put('profile')
  @Roles(UserProfilePermissions.UPDATE)
  @ApiProtected({
    path: '/api/v1/users/:userId/profile',
    roles: [UserProfilePermissions.UPDATE],
  })
  @ApiOperation({ summary: 'Upsert user profile' })
  @ApiParam({
    name: 'userId',
    description: 'Internal user id or Keycloak subject identifier.',
    example: '0d9ff3b3-0a4a-42c5-a5b6-d4f809ec4374',
  })
  @ApiBody({ type: UpdateUserProfileDto })
  @ApiOkResponse({ type: UserProfileResponseDto })
  @ApiDefaultErrors({
    path: '/api/v1/users/:userId/profile',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
    notFound: 'User not found',
  })
  @ResponseMessage('User profile updated successfully')
  updateProfile(
    @Param('userId') userId: string,
    @Body() dto: UpdateUserProfileDto,
  ) {
    return this.updateUserProfileUseCase.execute(userId, dto);
  }

  @Get('employment')
  @Roles(UserEmploymentPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/users/:userId/employment',
    roles: [UserEmploymentPermissions.VIEW],
  })
  @ApiOperation({ summary: 'Get user employment' })
  @ApiParam({
    name: 'userId',
    description: 'Internal user id or Keycloak subject identifier.',
    example: '0d9ff3b3-0a4a-42c5-a5b6-d4f809ec4374',
  })
  @ApiOkResponse({ type: UserEmploymentResponseDto })
  @ApiDefaultErrors({
    path: '/api/v1/users/:userId/employment',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
    notFound: 'User not found',
  })
  @ResponseMessage('User employment retrieved successfully')
  getEmployment(@Param('userId') userId: string) {
    return this.getUserEmploymentUseCase.execute(userId);
  }

  @Put('employment')
  @Roles(UserEmploymentPermissions.UPDATE)
  @ApiProtected({
    path: '/api/v1/users/:userId/employment',
    roles: [UserEmploymentPermissions.UPDATE],
  })
  @ApiOperation({ summary: 'Upsert user employment' })
  @ApiBody({ type: UpdateUserEmploymentDto })
  @ApiOkResponse({ type: UserEmploymentResponseDto })
  @ApiDefaultErrors({
    path: '/api/v1/users/:userId/employment',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
    notFound: 'User not found',
  })
  @ResponseMessage('User employment updated successfully')
  updateEmployment(
    @Param('userId') userId: string,
    @Body() dto: UpdateUserEmploymentDto,
  ) {
    return this.updateUserEmploymentUseCase.execute(userId, dto);
  }

  @Get('compensation')
  @Roles(UserCompensationPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/users/:userId/compensation',
    roles: [UserCompensationPermissions.VIEW],
  })
  @ApiOperation({ summary: 'Get user compensation' })
  @ApiParam({
    name: 'userId',
    description: 'Internal user id or Keycloak subject identifier.',
    example: '0d9ff3b3-0a4a-42c5-a5b6-d4f809ec4374',
  })
  @ApiOkResponse({ type: UserCompensationResponseDto })
  @ApiDefaultErrors({
    path: '/api/v1/users/:userId/compensation',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
    notFound: 'User not found',
  })
  @ResponseMessage('User compensation retrieved successfully')
  getCompensation(@Param('userId') userId: string) {
    return this.getUserCompensationUseCase.execute(userId);
  }

  @Put('compensation')
  @Roles(UserCompensationPermissions.UPDATE)
  @ApiProtected({
    path: '/api/v1/users/:userId/compensation',
    roles: [UserCompensationPermissions.UPDATE],
  })
  @ApiOperation({
    summary: 'Upsert user compensation and append history snapshot',
  })
  @ApiBody({ type: UpdateUserCompensationDto })
  @ApiOkResponse({ type: UserCompensationResponseDto })
  @ApiDefaultErrors({
    path: '/api/v1/users/:userId/compensation',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
    notFound: 'User not found',
  })
  @ResponseMessage('User compensation updated successfully')
  updateCompensation(
    @Param('userId') userId: string,
    @Body() dto: UpdateUserCompensationDto,
  ) {
    return this.updateUserCompensationUseCase.execute(userId, dto);
  }

  @Get('compensation/components')
  @Roles(UserCompensationPermissions.COMPONENT_VIEW)
  @ApiProtected({
    path: '/api/v1/users/:userId/compensation/components',
    roles: [UserCompensationPermissions.COMPONENT_VIEW],
  })
  @ApiOperation({ summary: 'List compensation components' })
  @ApiOkResponse({ type: CompensationComponentResponseDto, isArray: true })
  @ResponseMessage('Compensation components retrieved successfully')
  listCompensationComponents(@Param('userId') userId: string) {
    return this.listCompensationComponentsUseCase.execute(userId);
  }

  @Post('compensation/components')
  @Roles(UserCompensationPermissions.COMPONENT_MANAGE)
  @ApiProtected({
    path: '/api/v1/users/:userId/compensation/components',
    roles: [UserCompensationPermissions.COMPONENT_MANAGE],
  })
  @ApiOperation({ summary: 'Create compensation component' })
  @ApiBody({ type: CreateCompensationComponentDto })
  @ApiOkResponse({ type: CompensationComponentResponseDto })
  @ResponseMessage('Compensation component created successfully')
  createCompensationComponent(
    @Param('userId') userId: string,
    @Body() dto: CreateCompensationComponentDto,
  ) {
    return this.createCompensationComponentUseCase.execute(userId, dto);
  }

  @Put('compensation/components/:componentId')
  @Roles(UserCompensationPermissions.COMPONENT_MANAGE)
  @ApiProtected({
    path: '/api/v1/users/:userId/compensation/components/:componentId',
    roles: [UserCompensationPermissions.COMPONENT_MANAGE],
  })
  @ApiOperation({ summary: 'Update compensation component' })
  @ApiParam({ name: 'componentId' })
  @ApiBody({ type: UpdateCompensationComponentDto })
  @ApiOkResponse({ type: CompensationComponentResponseDto })
  @ResponseMessage('Compensation component updated successfully')
  updateCompensationComponent(
    @Param('userId') userId: string,
    @Param('componentId') componentId: string,
    @Body() dto: UpdateCompensationComponentDto,
  ) {
    return this.updateCompensationComponentUseCase.execute(
      userId,
      componentId,
      dto,
    );
  }

  @Delete('compensation/components/:componentId')
  @Roles(UserCompensationPermissions.COMPONENT_MANAGE)
  @ApiProtected({
    path: '/api/v1/users/:userId/compensation/components/:componentId',
    roles: [UserCompensationPermissions.COMPONENT_MANAGE],
  })
  @ApiOperation({ summary: 'Delete compensation component' })
  @ApiParam({ name: 'componentId' })
  @ApiOkResponse({
    schema: {
      example: {
        success: true,
      },
    },
  })
  @ResponseMessage('Compensation component deleted successfully')
  deleteCompensationComponent(
    @Param('userId') userId: string,
    @Param('componentId') componentId: string,
  ) {
    return this.deleteCompensationComponentUseCase.execute(userId, componentId);
  }

  @Get('compensation/history')
  @Roles(UserCompensationPermissions.HISTORY_VIEW)
  @ApiProtected({
    path: '/api/v1/users/:userId/compensation/history',
    roles: [UserCompensationPermissions.HISTORY_VIEW],
  })
  @ApiOperation({ summary: 'List user compensation history' })
  @ApiParam({
    name: 'userId',
    description: 'Internal user id or Keycloak subject identifier.',
    example: '0d9ff3b3-0a4a-42c5-a5b6-d4f809ec4374',
  })
  @ApiOkResponse({ type: UserCompensationHistoryResponseDto, isArray: true })
  @ApiDefaultErrors({
    path: '/api/v1/users/:userId/compensation/history',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
    notFound: 'User not found',
  })
  @ResponseMessage('User compensation history retrieved successfully')
  listCompensationHistory(@Param('userId') userId: string) {
    return this.listUserCompensationHistoryUseCase.execute(userId);
  }

  @Post('compensation/history')
  @Roles(UserCompensationPermissions.HISTORY_CREATE)
  @ApiProtected({
    path: '/api/v1/users/:userId/compensation/history',
    roles: [UserCompensationPermissions.HISTORY_CREATE],
  })
  @ApiOperation({ summary: 'Create compensation history entry' })
  @ApiBody({ type: CreateCompensationHistoryDto })
  @ApiOkResponse({ type: UserCompensationHistoryResponseDto })
  @ApiDefaultErrors({
    path: '/api/v1/users/:userId/compensation/history',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
    notFound: 'User not found',
  })
  @ResponseMessage('User compensation history entry created successfully')
  createCompensationHistory(
    @Param('userId') userId: string,
    @Body() dto: CreateCompensationHistoryDto,
  ) {
    return this.createUserCompensationHistoryUseCase.execute(userId, dto);
  }

  @Get('lifecycle')
  @Roles(UserLifecyclePermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/users/:userId/lifecycle',
    roles: [UserLifecyclePermissions.VIEW],
  })
  @ApiOperation({ summary: 'Get user lifecycle' })
  @ApiParam({
    name: 'userId',
    description: 'Internal user id or Keycloak subject identifier.',
    example: '0d9ff3b3-0a4a-42c5-a5b6-d4f809ec4374',
  })
  @ApiOkResponse({ type: UserLifecycleResponseDto })
  @ApiDefaultErrors({
    path: '/api/v1/users/:userId/lifecycle',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
    notFound: 'User not found',
  })
  @ResponseMessage('User lifecycle retrieved successfully')
  getLifecycle(@Param('userId') userId: string) {
    return this.getUserLifecycleUseCase.execute(userId);
  }

  @Put('lifecycle')
  @Roles(UserLifecyclePermissions.UPDATE)
  @ApiProtected({
    path: '/api/v1/users/:userId/lifecycle',
    roles: [UserLifecyclePermissions.UPDATE],
  })
  @ApiOperation({ summary: 'Upsert user lifecycle' })
  @ApiBody({ type: UpdateUserLifecycleDto })
  @ApiOkResponse({ type: UserLifecycleResponseDto })
  @ApiDefaultErrors({
    path: '/api/v1/users/:userId/lifecycle',
    badRequest:
      'terminatedAt is required when setting lifecycle status TERMINATED',
  })
  @ResponseMessage('User lifecycle updated successfully')
  updateLifecycle(
    @Param('userId') userId: string,
    @Body() dto: UpdateUserLifecycleDto,
  ) {
    return this.updateUserLifecycleUseCase.execute(userId, dto);
  }
}
