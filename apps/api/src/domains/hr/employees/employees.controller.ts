import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import {
  ApiDefaultErrors,
  ApiEnvelopeOkResponse,
  ApiProtected,
} from '../../../shared/docs/openapi';
import { KeycloakAuthGuard } from '../../../shared/guards/keycloak-auth.guard';
import { RbacGuard } from '../../../shared/guards/rbac.guard';
import { EmployeePermissions } from '@repo/types/rbac';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { ListEmployeesUseCase } from './use-cases/list-employees.usecase';
import { GetEmployeeFullUseCase } from './use-cases/get-employee-full.usecase';
import {
  EmployeeFullResponseDto,
  EmployeeListResponseDto,
} from './dto/employee-response.dto';

@ApiTags('HR Employees')
@Controller('hr/employees')
@UseGuards(KeycloakAuthGuard, RbacGuard)
export class EmployeesController {
  constructor(
    private readonly listEmployeesUseCase: ListEmployeesUseCase,
    private readonly getEmployeeFullUseCase: GetEmployeeFullUseCase,
  ) {}

  @Get()
  @Roles(EmployeePermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/employees',
    roles: [EmployeePermissions.VIEW],
  })
  @ApiOperation({ summary: 'List employees with filters' })
  @ApiEnvelopeOkResponse(EmployeeListResponseDto, 'Paginated list of employees')
  @ApiDefaultErrors({
    path: '/api/v1/hr/employees',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  list(
    @Query('departmentId') departmentId?: string,
    @Query('lifecycleStatus') lifecycleStatus?: string,
    @Query('employmentType') employmentType?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.listEmployeesUseCase.execute({
      departmentId,
      lifecycleStatus: lifecycleStatus as never,
      employmentType: employmentType as never,
      search,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get(':id')
  @Roles(EmployeePermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/employees/:id',
    roles: [EmployeePermissions.VIEW],
  })
  @ApiOperation({ summary: 'Get full employee record' })
  @ApiParam({
    name: 'id',
    description: 'Employee id, user id, or Keycloak subject',
  })
  @ApiEnvelopeOkResponse(EmployeeFullResponseDto, 'Full employee')
  @ApiDefaultErrors({
    path: '/api/v1/hr/employees/:id',
    notFound: 'Employee not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  getFull(@Param('id') id: string) {
    return this.getEmployeeFullUseCase.execute(id);
  }
}
