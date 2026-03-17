import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DepartmentPermissions } from '../rbac/constants/permissions.constants';
import { Roles } from '../../shared/decorators/roles.decorator';
import { ResponseMessage } from '../../shared/decorators/response-message.decorator';
import { ApiDefaultErrors, ApiProtected } from '../../shared/docs/openapi';
import { KeycloakAuthGuard } from '../../shared/guards/keycloak-auth.guard';
import { RbacGuard } from '../../shared/guards/rbac.guard';
import { DepartmentResponseDto } from './dto/department-response.dto';
import { ListDepartmentsUseCase } from './use-cases/list-departments.usecase';

@ApiTags('Departments')
@Controller('departments')
@UseGuards(KeycloakAuthGuard, RbacGuard)
export class DepartmentsController {
  constructor(
    private readonly listDepartmentsUseCase: ListDepartmentsUseCase,
  ) {}

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
