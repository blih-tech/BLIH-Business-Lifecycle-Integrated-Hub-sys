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
@Controller('hr/employees/:userId/documents')
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
    path: '/api/v1/hr/employees/:userId/documents',
    roles: [EmployeePermissions.VIEW, UserProfilePermissions.VIEW],
  })
  @ApiOperation({ summary: 'List employee documents' })
  @ApiParam({ name: 'userId', description: 'User id or Keycloak subject' })
  @ApiOkResponse({ description: 'List of documents' })
  list(@Param('userId') userId: string) {
    return this.listEmployeeDocumentsUseCase.execute(userId);
  }

  @Post()
  @Roles(EmployeePermissions.UPDATE, UserProfilePermissions.UPDATE)
  @ApiProtected({
    path: '/api/v1/hr/employees/:userId/documents',
    roles: [EmployeePermissions.UPDATE, UserProfilePermissions.UPDATE],
  })
  @ApiOperation({ summary: 'Create employee document' })
  @ApiParam({ name: 'userId', description: 'User id or Keycloak subject' })
  @ApiBody({ schema: { type: 'object', required: ['type', 'fileUrl'] } })
  @ApiOkResponse({ description: 'Created document' })
  create(
    @Param('userId') userId: string,
    @Body() body: CreateEmployeeDocumentDto,
  ) {
    return this.createEmployeeDocumentUseCase.execute(userId, body);
  }

  @Patch(':docId')
  @Roles(EmployeePermissions.UPDATE, UserProfilePermissions.UPDATE)
  @ApiProtected({
    path: '/api/v1/hr/employees/:userId/documents/:docId',
    roles: [EmployeePermissions.UPDATE, UserProfilePermissions.UPDATE],
  })
  @ApiOperation({ summary: 'Update employee document' })
  @ApiParam({ name: 'userId', description: 'User id or Keycloak subject' })
  @ApiParam({ name: 'docId', description: 'Document id' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiOkResponse({ description: 'Updated document' })
  update(
    @Param('userId') userId: string,
    @Param('docId') docId: string,
    @Body() body: UpdateEmployeeDocumentDto,
  ) {
    return this.updateEmployeeDocumentUseCase.execute(userId, docId, body);
  }
}
