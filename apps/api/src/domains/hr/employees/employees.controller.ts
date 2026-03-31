import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { randomUUID } from 'crypto';
import { KeycloakAuthGuard } from '../../../shared/guards/keycloak-auth.guard';
import { RbacGuard } from '../../../shared/guards/rbac.guard';
import { EmployeePermissions } from '@repo/types/rbac';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { CreateEmployeeDto } from './dto/employee-create.dto';
import { EmployeeListQueryDto } from './dto/employee-list-query.dto';
import { EmployeeListItemResponseDto } from './dto/employee-response.dto';
import { UpdateEmployeeDto } from './dto/employee-update.dto';
import {
  ApiCreateEmployee,
  ApiEmployeeTag,
  ApiGetEmployeeById,
  ApiListAllEmployees,
  ApiListPaginatedEmployees,
  ApiUpdateEmployee,
} from './docs/employees.docs';
import { CreateEmployeeUseCase } from './use-cases/create-employee.usecase';
import {
  GetEmployeeFullUseCase,
  ListAllEmployeesUseCase,
  ListPaginatedEmployeesUseCase,
} from './use-cases/list-employees.usecase';
import { UpdateEmployeeUseCase } from './use-cases/update-employee.usecase';

@ApiEmployeeTag()
@Controller('hr/employees')
@UseGuards(KeycloakAuthGuard, RbacGuard)
export class EmployeesController {
  constructor(
    private readonly createEmployee: CreateEmployeeUseCase,
    private readonly updateEmployee: UpdateEmployeeUseCase,
    private readonly listAllEmployees: ListAllEmployeesUseCase,
    private readonly listPaginatedEmployees: ListPaginatedEmployeesUseCase,
    private readonly getEmployeeFullUseCase: GetEmployeeFullUseCase,
  ) {}

  @Post()
  @Roles(EmployeePermissions.CREATE)
  @ApiCreateEmployee()
  create(@Body() body: CreateEmployeeDto) {
    return this.createEmployee.execute(body);
  }

  @Get()
  @Roles(EmployeePermissions.VIEW)
  @ApiListAllEmployees()
  listAll(
    @Query() query: EmployeeListQueryDto,
  ): Promise<EmployeeListItemResponseDto[]> {
    return this.listAllEmployees.execute(query);
  }

  @Get('paginated')
  @Roles(EmployeePermissions.VIEW)
  @ApiListPaginatedEmployees()
  listPaginated(@Query() query: EmployeeListQueryDto, @Req() req: Request) {
    const requestId =
      (req.headers['x-request-id'] as string | undefined) ?? randomUUID();
    return this.listPaginatedEmployees.execute(query, requestId);
  }

  @Get(':id')
  @Roles(EmployeePermissions.VIEW)
  @ApiGetEmployeeById()
  getFull(@Param('id') id: string) {
    return this.getEmployeeFullUseCase.execute(id);
  }

  @Patch(':id')
  @Roles(EmployeePermissions.UPDATE)
  @ApiUpdateEmployee()
  update(@Param('id') id: string, @Body() body: UpdateEmployeeDto) {
    return this.updateEmployee.execute(id, body);
  }
}
