import {
  Body,
  Controller,
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
import { ApiDefaultErrors, ApiProtected } from '../../shared/docs/openapi';
import { KeycloakAuthGuard } from '../../shared/guards/keycloak-auth.guard';
import { RbacGuard } from '../../shared/guards/rbac.guard';
import {
  UserCompensationPermissions,
  UserEmploymentPermissions,
  UserLifecyclePermissions,
  UserProfilePermissions,
} from '../rbac/constants/permissions.constants';
import { CreateCompensationHistoryDto } from './dto/create-compensation-history.dto';
import { UpdateUserCompensationDto } from './dto/update-user-compensation.dto';
import { UpdateUserEmploymentDto } from './dto/update-user-employment.dto';
import { UpdateUserLifecycleDto } from './dto/update-user-lifecycle.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { UserCompensationHistoryResponseDto } from './dto/user-compensation-history-response.dto';
import { UserCompensationResponseDto } from './dto/user-compensation-response.dto';
import { UserEmploymentResponseDto } from './dto/user-employment-response.dto';
import { UserLifecycleResponseDto } from './dto/user-lifecycle-response.dto';
import { UserProfileResponseDto } from './dto/user-profile-response.dto';
import { CreateUserCompensationHistoryUseCase } from './use-cases/create-user-compensation-history.usecase';
import { GetUserCompensationUseCase } from './use-cases/get-user-compensation.usecase';
import { GetUserEmploymentUseCase } from './use-cases/get-user-employment.usecase';
import { GetUserLifecycleUseCase } from './use-cases/get-user-lifecycle.usecase';
import { GetUserProfileUseCase } from './use-cases/get-user-profile.usecase';
import { ListUserCompensationHistoryUseCase } from './use-cases/list-user-compensation-history.usecase';
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
  @ApiParam({ name: 'userId', description: 'Internal user id or keycloak id' })
  @ApiOkResponse({ type: UserProfileResponseDto })
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
  @ApiParam({ name: 'userId', description: 'Internal user id or keycloak id' })
  @ApiBody({ type: UpdateUserProfileDto })
  @ApiOkResponse({ type: UserProfileResponseDto })
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
  @ApiOkResponse({ type: UserEmploymentResponseDto })
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
  @ApiOkResponse({ type: UserCompensationResponseDto })
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
  updateCompensation(
    @Param('userId') userId: string,
    @Body() dto: UpdateUserCompensationDto,
  ) {
    return this.updateUserCompensationUseCase.execute(userId, dto);
  }

  @Get('compensation/history')
  @Roles(UserCompensationPermissions.HISTORY_VIEW)
  @ApiProtected({
    path: '/api/v1/users/:userId/compensation/history',
    roles: [UserCompensationPermissions.HISTORY_VIEW],
  })
  @ApiOperation({ summary: 'List user compensation history' })
  @ApiOkResponse({ type: UserCompensationHistoryResponseDto, isArray: true })
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
  @ApiOkResponse({ type: UserLifecycleResponseDto })
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
  updateLifecycle(
    @Param('userId') userId: string,
    @Body() dto: UpdateUserLifecycleDto,
  ) {
    return this.updateUserLifecycleUseCase.execute(userId, dto);
  }
}
