import {
  Body,
  Controller,
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
import { ApiProtected } from '../../../shared/docs/openapi';
import { KeycloakAuthGuard } from '../../../shared/guards/keycloak-auth.guard';
import { RbacGuard } from '../../../shared/guards/rbac.guard';
import {
  EmployeePermissions,
  UserProfilePermissions,
} from '../../../core/rbac/constants/permissions.constants';
import { Roles } from '../../../shared/decorators/roles.decorator';
import type {
  CreateEmployeeDocumentDto,
  UpdateEmployeeDocumentDto,
} from '@repo/types';
import { ListEmployeeDocumentsUseCase } from './use-cases/list-employee-documents.usecase';
import { CreateEmployeeDocumentUseCase } from './use-cases/create-employee-document.usecase';
import { UpdateEmployeeDocumentUseCase } from './use-cases/update-employee-document.usecase';

@ApiTags('HR Employee Documents')
@Controller('hr/employees/:employeeId/documents')
@UseGuards(KeycloakAuthGuard, RbacGuard)
export class EmployeeDocumentsController {
  constructor(
    private readonly listEmployeeDocumentsUseCase: ListEmployeeDocumentsUseCase,
    private readonly createEmployeeDocumentUseCase: CreateEmployeeDocumentUseCase,
    private readonly updateEmployeeDocumentUseCase: UpdateEmployeeDocumentUseCase,
  ) {}

  @Get()
  @Roles(EmployeePermissions.VIEW, UserProfilePermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/employees/:employeeId/documents',
    roles: [EmployeePermissions.VIEW, UserProfilePermissions.VIEW],
  })
  @ApiOperation({ summary: 'List employee documents' })
  @ApiParam({
    name: 'employeeId',
    description: 'Employee id or linked user/keycloak subject',
  })
  @ApiOkResponse({ description: 'List of documents' })
  list(@Param('employeeId') employeeId: string) {
    return this.listEmployeeDocumentsUseCase.execute(employeeId);
  }

  @Post()
  @Roles(EmployeePermissions.UPDATE, UserProfilePermissions.UPDATE)
  @ApiProtected({
    path: '/api/v1/hr/employees/:employeeId/documents',
    roles: [EmployeePermissions.UPDATE, UserProfilePermissions.UPDATE],
  })
  @ApiOperation({ summary: 'Create employee document' })
  @ApiParam({
    name: 'employeeId',
    description: 'Employee id or linked user/keycloak subject',
  })
  @ApiBody({ schema: { type: 'object', required: ['type', 'fileUrl'] } })
  @ApiOkResponse({ description: 'Created document' })
  create(
    @Param('employeeId') employeeId: string,
    @Body() body: CreateEmployeeDocumentDto,
  ) {
    return this.createEmployeeDocumentUseCase.execute(employeeId, body);
  }

  @Patch(':docId')
  @Roles(EmployeePermissions.UPDATE, UserProfilePermissions.UPDATE)
  @ApiProtected({
    path: '/api/v1/hr/employees/:employeeId/documents/:docId',
    roles: [EmployeePermissions.UPDATE, UserProfilePermissions.UPDATE],
  })
  @ApiOperation({ summary: 'Update employee document' })
  @ApiParam({
    name: 'employeeId',
    description: 'Employee id or linked user/keycloak subject',
  })
  @ApiParam({ name: 'docId', description: 'Document id' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiOkResponse({ description: 'Updated document' })
  update(
    @Param('employeeId') employeeId: string,
    @Param('docId') docId: string,
    @Body() body: UpdateEmployeeDocumentDto,
  ) {
    return this.updateEmployeeDocumentUseCase.execute(employeeId, docId, body);
  }
}
