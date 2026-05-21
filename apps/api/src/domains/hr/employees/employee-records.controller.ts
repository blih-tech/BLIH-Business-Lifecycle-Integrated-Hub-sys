import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CreateCompensationComponentDto } from '../../../core/users/dto/create-compensation-component.dto';
import { UpdateCompensationComponentDto } from '../../../core/users/dto/update-compensation-component.dto';
import { UpdateUserCompensationDto } from '../../../core/users/dto/update-user-compensation.dto';
import { UpdateUserEmploymentDto } from '../../../core/users/dto/update-user-employment.dto';
import { UpdateUserLifecycleDto } from '../../../core/users/dto/update-user-lifecycle.dto';
import { UpdateUserProfileDto } from '../../../core/users/dto/update-user-profile.dto';
import { CreateCompensationComponentUseCase } from '../../../core/users/use-cases/create-compensation-component.usecase';
import { DeleteCompensationComponentUseCase } from '../../../core/users/use-cases/delete-compensation-component.usecase';
import { GetUserCompensationUseCase } from '../../../core/users/use-cases/get-user-compensation.usecase';
import { GetUserEmploymentUseCase } from '../../../core/users/use-cases/get-user-employment.usecase';
import { GetUserLifecycleUseCase } from '../../../core/users/use-cases/get-user-lifecycle.usecase';
import { GetUserProfileUseCase } from '../../../core/users/use-cases/get-user-profile.usecase';
import { ListCompensationComponentsUseCase } from '../../../core/users/use-cases/list-compensation-components.usecase';
import { ListUserCompensationHistoryUseCase } from '../../../core/users/use-cases/list-user-compensation-history.usecase';
import { UpdateCompensationComponentUseCase } from '../../../core/users/use-cases/update-compensation-component.usecase';
import { UpdateUserCompensationUseCase } from '../../../core/users/use-cases/update-user-compensation.usecase';
import { UpdateUserEmploymentUseCase } from '../../../core/users/use-cases/update-user-employment.usecase';
import { UpdateUserLifecycleUseCase } from '../../../core/users/use-cases/update-user-lifecycle.usecase';
import { UpdateUserProfileUseCase } from '../../../core/users/use-cases/update-user-profile.usecase';
import {
  EmployeePermissions,
  UserCompensationPermissions,
  UserEmploymentPermissions,
  UserLifecyclePermissions,
  UserProfilePermissions,
} from '@repo/types/rbac';
import { Audit } from '../../../shared/decorators/audit.decorator';
import { Roles } from '../../../shared/decorators/roles.decorator';
import {
  ApiDefaultErrors,
  ApiEnvelopeArrayResponse,
  ApiEnvelopeOkResponse,
  ApiProtected,
} from '../../../shared/docs/openapi';
import { KeycloakAuthGuard } from '../../../shared/guards/keycloak-auth.guard';
import { RbacGuard } from '../../../shared/guards/rbac.guard';
import { CompensationComponentResponseDto } from '../../../core/users/dto/compensation-component-response.dto';
import { UserCompensationHistoryResponseDto } from '../../../core/users/dto/user-compensation-history-response.dto';
import { UserCompensationResponseDto } from '../../../core/users/dto/user-compensation-response.dto';
import { UserEmploymentResponseDto } from '../../../core/users/dto/user-employment-response.dto';
import { UserLifecycleResponseDto } from '../../../core/users/dto/user-lifecycle-response.dto';
import { UserProfileResponseDto } from '../../../core/users/dto/user-profile-response.dto';

@ApiTags('HR Employee Records')
@Controller('hr/employees/:employeeId')
@UseGuards(KeycloakAuthGuard, RbacGuard)
export class EmployeeRecordsController {
  constructor(
    private readonly getUserProfileUseCase: GetUserProfileUseCase,
    private readonly updateUserProfileUseCase: UpdateUserProfileUseCase,
    private readonly getUserEmploymentUseCase: GetUserEmploymentUseCase,
    private readonly updateUserEmploymentUseCase: UpdateUserEmploymentUseCase,
    private readonly getUserLifecycleUseCase: GetUserLifecycleUseCase,
    private readonly updateUserLifecycleUseCase: UpdateUserLifecycleUseCase,
    private readonly getUserCompensationUseCase: GetUserCompensationUseCase,
    private readonly updateUserCompensationUseCase: UpdateUserCompensationUseCase,
    private readonly listUserCompensationHistoryUseCase: ListUserCompensationHistoryUseCase,
    private readonly listCompensationComponentsUseCase: ListCompensationComponentsUseCase,
    private readonly createCompensationComponentUseCase: CreateCompensationComponentUseCase,
    private readonly updateCompensationComponentUseCase: UpdateCompensationComponentUseCase,
    // @ts-expect-error injected for future Delete endpoint
    private readonly _deleteCompensationComponentUseCase: DeleteCompensationComponentUseCase,
  ) {}

  @Get('profile')
  @Roles(EmployeePermissions.VIEW, UserProfilePermissions.VIEW)
  @Audit('employee.profile.get', 'hr.employee')
  @ApiProtected({
    path: '/api/v1/hr/employees/:employeeId/profile',
    roles: [EmployeePermissions.VIEW, UserProfilePermissions.VIEW],
  })
  @ApiOperation({ summary: 'Get employee profile record' })
  @ApiParam({ name: 'employeeId' })
  @ApiEnvelopeOkResponse(UserProfileResponseDto, 'Employee profile')
  @ApiDefaultErrors({
    path: '/api/v1/hr/employees/:employeeId/profile',
    notFound: 'Employee not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  getProfile(@Param('employeeId') employeeId: string) {
    return this.getUserProfileUseCase.execute(employeeId);
  }

  @Patch('profile')
  @Roles(EmployeePermissions.UPDATE, UserProfilePermissions.UPDATE)
  @Audit('employee.profile.update', 'hr.employee')
  @ApiProtected({
    path: '/api/v1/hr/employees/:employeeId/profile',
    roles: [EmployeePermissions.UPDATE, UserProfilePermissions.UPDATE],
  })
  @ApiOperation({ summary: 'Update employee profile record' })
  @ApiParam({ name: 'employeeId' })
  @ApiBody({ type: UpdateUserProfileDto })
  @ApiEnvelopeOkResponse(UserProfileResponseDto, 'Updated employee profile')
  @ApiDefaultErrors({
    path: '/api/v1/hr/employees/:employeeId/profile',
    badRequest: 'Employee profile payload is invalid',
    notFound: 'Employee not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  updateProfile(
    @Param('employeeId') employeeId: string,
    @Body() body: UpdateUserProfileDto,
  ) {
    return this.updateUserProfileUseCase.execute(employeeId, body);
  }

  @Get('employment')
  @Roles(EmployeePermissions.VIEW, UserEmploymentPermissions.VIEW)
  @Audit('employee.employment.get', 'hr.employee')
  @ApiProtected({
    path: '/api/v1/hr/employees/:employeeId/employment',
    roles: [EmployeePermissions.VIEW, UserEmploymentPermissions.VIEW],
  })
  @ApiOperation({ summary: 'Get employee employment record' })
  @ApiParam({ name: 'employeeId' })
  @ApiEnvelopeOkResponse(UserEmploymentResponseDto, 'Employee employment')
  @ApiDefaultErrors({
    path: '/api/v1/hr/employees/:employeeId/employment',
    notFound: 'Employee not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  getEmployment(@Param('employeeId') employeeId: string) {
    return this.getUserEmploymentUseCase.execute(employeeId);
  }

  @Patch('employment')
  @Roles(EmployeePermissions.UPDATE, UserEmploymentPermissions.UPDATE)
  @Audit('employee.employment.update', 'hr.employee')
  @ApiProtected({
    path: '/api/v1/hr/employees/:employeeId/employment',
    roles: [EmployeePermissions.UPDATE, UserEmploymentPermissions.UPDATE],
  })
  @ApiOperation({ summary: 'Update employee employment record' })
  @ApiParam({ name: 'employeeId' })
  @ApiBody({ type: UpdateUserEmploymentDto })
  @ApiEnvelopeOkResponse(
    UserEmploymentResponseDto,
    'Updated employee employment',
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/employees/:employeeId/employment',
    badRequest: 'Employee employment payload is invalid',
    notFound: 'Employee not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  updateEmployment(
    @Param('employeeId') employeeId: string,
    @Body() body: UpdateUserEmploymentDto,
  ) {
    return this.updateUserEmploymentUseCase.execute(employeeId, body);
  }

  @Get('lifecycle')
  @Roles(EmployeePermissions.VIEW, UserLifecyclePermissions.VIEW)
  @Audit('employee.lifecycle.get', 'hr.employee')
  @ApiProtected({
    path: '/api/v1/hr/employees/:employeeId/lifecycle',
    roles: [EmployeePermissions.VIEW, UserLifecyclePermissions.VIEW],
  })
  @ApiOperation({ summary: 'Get employee lifecycle record' })
  @ApiParam({ name: 'employeeId' })
  @ApiEnvelopeOkResponse(UserLifecycleResponseDto, 'Employee lifecycle')
  @ApiDefaultErrors({
    path: '/api/v1/hr/employees/:employeeId/lifecycle',
    notFound: 'Employee not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  getLifecycle(@Param('employeeId') employeeId: string) {
    return this.getUserLifecycleUseCase.execute(employeeId);
  }

  @Patch('lifecycle')
  @Roles(EmployeePermissions.UPDATE, UserLifecyclePermissions.UPDATE)
  @Audit('employee.lifecycle.update', 'hr.employee')
  @ApiProtected({
    path: '/api/v1/hr/employees/:employeeId/lifecycle',
    roles: [EmployeePermissions.UPDATE, UserLifecyclePermissions.UPDATE],
  })
  @ApiOperation({ summary: 'Update employee lifecycle record' })
  @ApiParam({ name: 'employeeId' })
  @ApiBody({ type: UpdateUserLifecycleDto })
  @ApiEnvelopeOkResponse(UserLifecycleResponseDto, 'Updated employee lifecycle')
  @ApiDefaultErrors({
    path: '/api/v1/hr/employees/:employeeId/lifecycle',
    badRequest: 'Employee lifecycle payload is invalid',
    notFound: 'Employee not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  updateLifecycle(
    @Param('employeeId') employeeId: string,
    @Body() body: UpdateUserLifecycleDto,
  ) {
    return this.updateUserLifecycleUseCase.execute(employeeId, body);
  }

  @Get('compensation')
  @Roles(EmployeePermissions.VIEW, UserCompensationPermissions.VIEW)
  @Audit('employee.compensation.get', 'hr.employee')
  @ApiProtected({
    path: '/api/v1/hr/employees/:employeeId/compensation',
    roles: [EmployeePermissions.VIEW, UserCompensationPermissions.VIEW],
  })
  @ApiOperation({ summary: 'Get current employee compensation' })
  @ApiParam({ name: 'employeeId' })
  @ApiEnvelopeOkResponse(UserCompensationResponseDto, 'Employee compensation')
  @ApiDefaultErrors({
    path: '/api/v1/hr/employees/:employeeId/compensation',
    notFound: 'Employee not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  getCompensation(@Param('employeeId') employeeId: string) {
    return this.getUserCompensationUseCase.execute(employeeId);
  }

  @Patch('compensation')
  @Roles(EmployeePermissions.UPDATE, UserCompensationPermissions.UPDATE)
  @Audit('employee.compensation.update', 'hr.employee')
  @ApiProtected({
    path: '/api/v1/hr/employees/:employeeId/compensation',
    roles: [EmployeePermissions.UPDATE, UserCompensationPermissions.UPDATE],
  })
  @ApiOperation({ summary: 'Update employee compensation' })
  @ApiParam({ name: 'employeeId' })
  @ApiBody({ type: UpdateUserCompensationDto })
  @ApiEnvelopeOkResponse(
    UserCompensationResponseDto,
    'Updated employee compensation',
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/employees/:employeeId/compensation',
    badRequest: 'Employee compensation payload is invalid',
    notFound: 'Employee not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  updateCompensation(
    @Param('employeeId') employeeId: string,
    @Body() body: UpdateUserCompensationDto,
  ) {
    return this.updateUserCompensationUseCase.execute(employeeId, body);
  }

  @Get('compensation/history')
  @Roles(EmployeePermissions.VIEW, UserCompensationPermissions.HISTORY_VIEW)
  @Audit('employee.compensation.history.list', 'hr.employee')
  @ApiProtected({
    path: '/api/v1/hr/employees/:employeeId/compensation/history',
    roles: [EmployeePermissions.VIEW, UserCompensationPermissions.HISTORY_VIEW],
  })
  @ApiOperation({ summary: 'List employee compensation history' })
  @ApiParam({ name: 'employeeId' })
  @ApiEnvelopeArrayResponse(
    UserCompensationHistoryResponseDto,
    'Employee compensation history',
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/employees/:employeeId/compensation/history',
    notFound: 'Employee not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  listCompensationHistory(@Param('employeeId') employeeId: string) {
    return this.listUserCompensationHistoryUseCase.execute(employeeId);
  }

  @Get('compensation/components')
  @Roles(EmployeePermissions.VIEW, UserCompensationPermissions.COMPONENT_VIEW)
  @Audit('employee.compensation.components.list', 'hr.employee')
  @ApiProtected({
    path: '/api/v1/hr/employees/:employeeId/compensation/components',
    roles: [
      EmployeePermissions.VIEW,
      UserCompensationPermissions.COMPONENT_VIEW,
    ],
  })
  @ApiOperation({ summary: 'List employee compensation components' })
  @ApiParam({ name: 'employeeId' })
  @ApiEnvelopeArrayResponse(
    CompensationComponentResponseDto,
    'Employee compensation components',
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/employees/:employeeId/compensation/components',
    notFound: 'Employee not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  listCompensationComponents(@Param('employeeId') employeeId: string) {
    return this.listCompensationComponentsUseCase.execute(employeeId);
  }

  @Post('compensation/components')
  @Roles(
    EmployeePermissions.UPDATE,
    UserCompensationPermissions.COMPONENT_MANAGE,
  )
  @Audit('employee.compensation.components.create', 'hr.employee')
  @ApiProtected({
    path: '/api/v1/hr/employees/:employeeId/compensation/components',
    roles: [
      EmployeePermissions.UPDATE,
      UserCompensationPermissions.COMPONENT_MANAGE,
    ],
  })
  @ApiOperation({ summary: 'Add employee compensation component' })
  @ApiParam({ name: 'employeeId' })
  @ApiBody({ type: CreateCompensationComponentDto })
  @ApiEnvelopeOkResponse(
    CompensationComponentResponseDto,
    'Created compensation component',
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/employees/:employeeId/compensation/components',
    badRequest: 'Compensation component payload is invalid',
    notFound: 'Employee not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  createCompensationComponent(
    @Param('employeeId') employeeId: string,
    @Body() body: CreateCompensationComponentDto,
  ) {
    return this.createCompensationComponentUseCase.execute(employeeId, body);
  }

  @Patch('compensation/components/:componentId')
  @Roles(
    EmployeePermissions.UPDATE,
    UserCompensationPermissions.COMPONENT_MANAGE,
  )
  @Audit('employee.compensation.components.update', 'hr.employee')
  @ApiProtected({
    path: '/api/v1/hr/employees/:employeeId/compensation/components/:componentId',
    roles: [
      EmployeePermissions.UPDATE,
      UserCompensationPermissions.COMPONENT_MANAGE,
    ],
  })
  @ApiOperation({ summary: 'Update employee compensation component' })
  @ApiParam({ name: 'employeeId' })
  @ApiParam({ name: 'componentId' })
  @ApiBody({ type: UpdateCompensationComponentDto })
  @ApiEnvelopeOkResponse(
    CompensationComponentResponseDto,
    'Updated compensation component',
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/employees/:employeeId/compensation/components/:componentId',
    badRequest: 'Compensation component payload is invalid',
    notFound: 'Employee or compensation component not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  updateCompensationComponent(
    @Param('employeeId') employeeId: string,
    @Param('componentId') componentId: string,
    @Body() body: UpdateCompensationComponentDto,
  ) {
    return this.updateCompensationComponentUseCase.execute(
      employeeId,
      componentId,
      body,
    );
  }
}
