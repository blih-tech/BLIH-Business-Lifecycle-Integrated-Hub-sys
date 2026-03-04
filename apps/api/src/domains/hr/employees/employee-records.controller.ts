import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
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
} from '../../../core/rbac/constants/permissions.constants';
import { Audit } from '../../../shared/decorators/audit.decorator';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { ApiProtected } from '../../../shared/docs/openapi';
import { KeycloakAuthGuard } from '../../../shared/guards/keycloak-auth.guard';
import { RbacGuard } from '../../../shared/guards/rbac.guard';

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
    private readonly deleteCompensationComponentUseCase: DeleteCompensationComponentUseCase,
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
  @ApiOkResponse({ description: 'Employee profile' })
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
  @ApiOkResponse({ description: 'Updated employee profile' })
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
  @ApiOkResponse({ description: 'Employee employment' })
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
  @ApiOkResponse({ description: 'Updated employee employment' })
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
  @ApiOkResponse({ description: 'Employee lifecycle' })
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
  @ApiOkResponse({ description: 'Updated employee lifecycle' })
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
  @ApiOkResponse({ description: 'Employee compensation' })
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
  @ApiOkResponse({ description: 'Updated employee compensation' })
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
  @ApiOkResponse({ description: 'Employee compensation history' })
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
  @ApiOkResponse({ description: 'Employee compensation components' })
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
  @ApiOkResponse({ description: 'Created compensation component' })
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
  @ApiOkResponse({ description: 'Updated compensation component' })
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

  @Delete('compensation/components/:componentId')
  @Roles(
    EmployeePermissions.UPDATE,
    UserCompensationPermissions.COMPONENT_MANAGE,
  )
  @Audit('employee.compensation.components.delete', 'hr.employee')
  @ApiProtected({
    path: '/api/v1/hr/employees/:employeeId/compensation/components/:componentId',
    roles: [
      EmployeePermissions.UPDATE,
      UserCompensationPermissions.COMPONENT_MANAGE,
    ],
  })
  @ApiOperation({ summary: 'Delete employee compensation component' })
  @ApiParam({ name: 'employeeId' })
  @ApiParam({ name: 'componentId' })
  @ApiOkResponse({ description: 'Deleted compensation component' })
  deleteCompensationComponent(
    @Param('employeeId') employeeId: string,
    @Param('componentId') componentId: string,
  ) {
    return this.deleteCompensationComponentUseCase.execute(
      employeeId,
      componentId,
    );
  }
}
