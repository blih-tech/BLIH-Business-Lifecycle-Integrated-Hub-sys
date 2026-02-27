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
import { Audit } from '../../shared/decorators/audit.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';
import { ApiDefaultErrors, ApiProtected } from '../../shared/docs/openapi';
import { KeycloakAuthGuard } from '../../shared/guards/keycloak-auth.guard';
import { RbacGuard } from '../../shared/guards/rbac.guard';
import { DepartmentPermissions } from '../rbac/constants/permissions.constants';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { DepartmentResponseDto } from './dto/department-response.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { CreateDepartmentUseCase } from './use-cases/create-department.usecase';
import { DeleteDepartmentUseCase } from './use-cases/delete-department.usecase';
import { GetDepartmentUseCase } from './use-cases/get-department.usecase';
import { ListDepartmentsUseCase } from './use-cases/list-departments.usecase';
import { UpdateDepartmentUseCase } from './use-cases/update-department.usecase';

@ApiTags('Departments')
@Controller('departments')
@UseGuards(KeycloakAuthGuard, RbacGuard)
export class DepartmentsController {
  constructor(
    private readonly createDepartmentUseCase: CreateDepartmentUseCase,
    private readonly listDepartmentsUseCase: ListDepartmentsUseCase,
    private readonly getDepartmentUseCase: GetDepartmentUseCase,
    private readonly updateDepartmentUseCase: UpdateDepartmentUseCase,
    private readonly deleteDepartmentUseCase: DeleteDepartmentUseCase,
  ) {}

  @Get()
  @Roles(DepartmentPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/departments',
    roles: [DepartmentPermissions.VIEW],
  })
  @ApiOperation({
    summary: 'List departments',
    description: 'Returns all departments.',
  })
  @ApiOkResponse({
    description: 'Department list.',
    type: DepartmentResponseDto,
    isArray: true,
  })
  listDepartments() {
    return this.listDepartmentsUseCase.execute();
  }

  @Get(':departmentId')
  @Roles(DepartmentPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/departments/:departmentId',
    roles: [DepartmentPermissions.VIEW],
  })
  @ApiOperation({
    summary: 'Get department',
    description: 'Returns department details by id.',
  })
  @ApiParam({
    name: 'departmentId',
    description: 'Department id.',
    example: '1f31a301-dfb8-4071-aab1-ad6bc4891da7',
  })
  @ApiOkResponse({
    description: 'Department details.',
    type: DepartmentResponseDto,
  })
  getDepartment(@Param('departmentId') departmentId: string) {
    return this.getDepartmentUseCase.execute(departmentId);
  }

  @Post()
  @Roles(DepartmentPermissions.CREATE)
  @Audit('department.create', 'system.department')
  @ApiProtected({
    path: '/api/v1/departments',
    roles: [DepartmentPermissions.CREATE],
  })
  @ApiOperation({
    summary: 'Create department',
    description: 'Creates a new department.',
  })
  @ApiBody({
    type: CreateDepartmentDto,
  })
  @ApiOkResponse({
    description: 'Department created successfully.',
    type: DepartmentResponseDto,
  })
  createDepartment(@Body() dto: CreateDepartmentDto) {
    return this.createDepartmentUseCase.execute(dto);
  }

  @Put(':departmentId')
  @Roles(DepartmentPermissions.UPDATE)
  @Audit('department.update', 'system.department')
  @ApiProtected({
    path: '/api/v1/departments/:departmentId',
    roles: [DepartmentPermissions.UPDATE],
  })
  @ApiOperation({
    summary: 'Update department',
    description: 'Updates department name and/or description.',
  })
  @ApiParam({
    name: 'departmentId',
    description: 'Department id.',
    example: '1f31a301-dfb8-4071-aab1-ad6bc4891da7',
  })
  @ApiBody({
    type: UpdateDepartmentDto,
  })
  @ApiOkResponse({
    description: 'Updated department.',
    type: DepartmentResponseDto,
  })
  updateDepartment(
    @Param('departmentId') departmentId: string,
    @Body() dto: UpdateDepartmentDto,
  ) {
    return this.updateDepartmentUseCase.execute(departmentId, dto);
  }

  @Delete(':departmentId')
  @Roles(DepartmentPermissions.DELETE)
  @Audit('department.delete', 'system.department')
  @ApiProtected({
    path: '/api/v1/departments/:departmentId',
    roles: [DepartmentPermissions.DELETE],
  })
  @ApiOperation({
    summary: 'Delete department',
    description: 'Deletes a department if no users are linked to it.',
  })
  @ApiParam({
    name: 'departmentId',
    description: 'Department id.',
    example: '1f31a301-dfb8-4071-aab1-ad6bc4891da7',
  })
  @ApiOkResponse({
    description: 'Delete result.',
    schema: {
      example: {
        success: true,
        deletedDepartment: 'Finance',
      },
    },
  })
  @ApiDefaultErrors({
    path: '/api/v1/departments/1f31a301-dfb8-4071-aab1-ad6bc4891da7',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
    notFound: 'Department not found',
  })
  deleteDepartment(@Param('departmentId') departmentId: string) {
    return this.deleteDepartmentUseCase.execute(departmentId);
  }
}
