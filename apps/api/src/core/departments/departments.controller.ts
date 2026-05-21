import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { DepartmentPermissions } from '@repo/types/rbac';
import { Audit } from '../../shared/decorators/audit.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';
import { ResponseMessage } from '../../shared/decorators/response-message.decorator';
import { ApiDefaultErrors, ApiProtected } from '../../shared/docs/openapi';
import { KeycloakAuthGuard } from '../../shared/guards/keycloak-auth.guard';
import { RbacGuard } from '../../shared/guards/rbac.guard';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { DepartmentResponseDto } from './dto/department-response.dto';
import { CreateDepartmentUseCase } from './use-cases/create-department.usecase';
import { ListDepartmentsUseCase } from './use-cases/list-departments.usecase';

@ApiTags('Departments')
@Controller('departments')
@UseGuards(KeycloakAuthGuard, RbacGuard)
export class DepartmentsController {
  constructor(
    private readonly createDepartmentUseCase: CreateDepartmentUseCase,
    private readonly listDepartmentsUseCase: ListDepartmentsUseCase,
  ) {}

  @Post()
  @Roles(DepartmentPermissions.CREATE)
  @Audit('department.create', 'system.department')
  @ApiProtected({
    path: '/api/v1/departments',
    roles: [DepartmentPermissions.CREATE],
  })
  @ApiOperation({
    summary: 'Create department',
    description:
      'Creates a department master record for org structure and HR workflows.',
  })
  @ApiBody({
    type: CreateDepartmentDto,
    examples: {
      createDepartment: {
        summary: 'Create department payload',
        value: {
          name: 'Engineering',
          description: 'Software engineering and platform teams.',
          parentId: null,
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Department created successfully.',
    type: DepartmentResponseDto,
  })
  @ApiDefaultErrors({
    path: '/api/v1/departments',
    badRequest: 'Department name is required',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
    notFound: 'Parent department not found',
  })
  @ResponseMessage('Department created successfully')
  createDepartment(@Body() dto: CreateDepartmentDto) {
    return this.createDepartmentUseCase.execute(dto);
  }

  @Get()
  @Roles(DepartmentPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/departments',
    roles: [DepartmentPermissions.VIEW],
  })
  @ApiOperation({
    summary: 'List departments',
    description: 'Returns department master data sorted by name.',
  })
  @ApiOkResponse({
    description: 'Department list.',
    type: DepartmentResponseDto,
    isArray: true,
    schema: {
      example: [
        {
          id: '1f31a301-dfb8-4071-aab1-ad6bc4891da7',
          name: 'Engineering',
          parentId: null,
        },
      ],
    },
  })
  @ApiDefaultErrors({
    path: '/api/v1/departments',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  @ResponseMessage('Departments retrieved successfully')
  listDepartments() {
    return this.listDepartmentsUseCase.execute();
  }
}
