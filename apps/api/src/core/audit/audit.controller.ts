import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Audit } from '../../shared/decorators/audit.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';
import { ApiDefaultErrors, ApiProtected } from '../../shared/docs/openapi';
import { KeycloakAuthGuard } from '../../shared/guards/keycloak-auth.guard';
import { RbacGuard } from '../../shared/guards/rbac.guard';
import { SystemAuditPermissions } from '../rbac/constants/permissions.constants';
import { AuditQueryDto } from './dto/audit-query.dto';
import { AuditRecordDto } from './dto/audit-record.dto';
import { ExportAuditUseCase } from './use-cases/export-audit.usecase';
import { QueryAuditUseCase } from './use-cases/query-audit.usecase';
import { RecordAuditUseCase } from './use-cases/record-audit.usecase';

@ApiTags('Audit')
@Controller('audit')
@UseGuards(KeycloakAuthGuard, RbacGuard)
export class AuditController {
  constructor(
    private readonly recordAuditUseCase: RecordAuditUseCase,
    private readonly queryAuditUseCase: QueryAuditUseCase,
    private readonly exportAuditUseCase: ExportAuditUseCase,
  ) {}

  @Post('records')
  @Roles(SystemAuditPermissions.CREATE)
  @Audit('audit.record', 'system.audit')
  @ApiProtected({
    path: '/api/v1/audit/records',
    roles: ['system_audit:create'],
  })
  @ApiOperation({
    summary: 'Record audit entry',
    description:
      'Persists a single audit log entry in the target realm. Requires role `system_audit:create`.',
  })
  @ApiBody({
    type: AuditRecordDto,
    examples: {
      createAuditRecord: {
        summary: 'Audit record payload',
        value: {
          action: 'user.update',
          module: 'system.user',
          resource: 'user',
          resourceId: '0d9ff3b3-0a4a-42c5-a5b6-d4f809ec4374',
          actorUserId: '40b5c2fb-7a2f-4af2-ac03-fad1bb3fe061',
          actorEmail: 'admin@blih.local',
          requestId: 'req-4fda5e87cd',
          correlationId: 'corr-5dfe12fce',
          ipAddress: '10.0.10.14',
          userAgent: 'Mozilla/5.0',
          result: 'SUCCESS',
          statusCode: 200,
          metadata: { source: 'api' },
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Audit entry persisted successfully.',
    schema: {
      example: {
        id: '78b3b392-3f3d-4b97-a853-b57f7bf5f053',
        action: 'user.update',
        module: 'system.user',
        resource: 'user',
        resourceId: '0d9ff3b3-0a4a-42c5-a5b6-d4f809ec4374',
        actorUserId: '40b5c2fb-7a2f-4af2-ac03-fad1bb3fe061',
        actorEmail: 'admin@blih.local',
        requestId: 'req-4fda5e87cd',
        correlationId: 'corr-5dfe12fce',
        ipAddress: '10.0.10.14',
        userAgent: 'Mozilla/5.0',
        result: 'SUCCESS',
        statusCode: 200,
        before: null,
        after: null,
        metadata: { source: 'api' },
        createdAt: '2026-02-15T11:45:00.000Z',
      },
    },
  })
  @ApiDefaultErrors({
    path: '/api/v1/audit/records',
    badRequest: {
      message: ['statusCode must not be greater than 599'],
      error: 'Bad Request',
      statusCode: 400,
    },
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  async create(@Body() dto: AuditRecordDto) {
    return this.recordAuditUseCase.execute(dto);
  }

  @Get('logs')
  @Roles(SystemAuditPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/audit/logs',
    roles: ['system_audit:view'],
  })
  @ApiOperation({
    summary: 'Query audit logs',
    description:
      'Retrieves audit logs filtered by optional query parameters. Requires role `system_audit:view`.',
  })
  @ApiQuery({ name: 'action', required: false, example: 'user.update' })
  @ApiQuery({ name: 'module', required: false, example: 'system.user' })
  @ApiQuery({
    name: 'actorUserId',
    required: false,
    example: '40b5c2fb-7a2f-4af2-ac03-fad1bb3fe061',
  })
  @ApiQuery({
    name: 'result',
    required: false,
    enum: ['SUCCESS', 'FAILURE'],
    example: 'FAILURE',
  })
  @ApiQuery({ name: 'statusCode', required: false, type: Number, example: 403 })
  @ApiQuery({
    name: 'from',
    required: false,
    type: String,
    example: '2026-02-01T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'to',
    required: false,
    type: String,
    example: '2026-02-15T23:59:59.999Z',
  })
  @ApiOkResponse({
    description: 'Filtered audit logs.',
    schema: {
      example: [
        {
          id: '78b3b392-3f3d-4b97-a853-b57f7bf5f053',
          action: 'user.update',
          module: 'system.user',
          resource: 'user',
          resourceId: '0d9ff3b3-0a4a-42c5-a5b6-d4f809ec4374',
          actorUserId: '40b5c2fb-7a2f-4af2-ac03-fad1bb3fe061',
          actorEmail: 'admin@blih.local',
          requestId: 'req-4fda5e87cd',
          correlationId: 'corr-5dfe12fce',
          ipAddress: '10.0.10.14',
          userAgent: 'Mozilla/5.0',
          result: 'SUCCESS',
          statusCode: 200,
          createdAt: '2026-02-15T11:45:00.000Z',
        },
      ],
    },
  })
  @ApiDefaultErrors({
    path: '/api/v1/audit/logs',
    badRequest: {
      message: ['from must be a valid ISO 8601 date string'],
      error: 'Bad Request',
      statusCode: 400,
    },
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  async query(@Query() dto: AuditQueryDto) {
    return this.queryAuditUseCase.execute(dto);
  }

  @Get('export')
  @Roles(SystemAuditPermissions.EXPORT)
  @ApiProtected({
    path: '/api/v1/audit/export',
    roles: ['system_audit:export'],
  })
  @ApiOperation({
    summary: 'Export audit logs',
    description:
      'Exports filtered audit logs in CSV content format. Requires role `system_audit:export`.',
  })
  @ApiQuery({ name: 'action', required: false, example: 'user.update' })
  @ApiQuery({ name: 'module', required: false, example: 'system.user' })
  @ApiQuery({
    name: 'actorUserId',
    required: false,
    example: '40b5c2fb-7a2f-4af2-ac03-fad1bb3fe061',
  })
  @ApiQuery({
    name: 'result',
    required: false,
    enum: ['SUCCESS', 'FAILURE'],
    example: 'FAILURE',
  })
  @ApiQuery({ name: 'statusCode', required: false, type: Number, example: 403 })
  @ApiQuery({
    name: 'from',
    required: false,
    type: String,
    example: '2026-02-01T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'to',
    required: false,
    type: String,
    example: '2026-02-15T23:59:59.999Z',
  })
  @ApiOkResponse({
    description: 'CSV export payload for requested filters.',
    schema: {
      example: {
        format: 'csv',
        content:
          'id,action,module,resource,result,statusCode,actorUserId,requestId,createdAt\n78b3b392-3f3d-4b97-a853-b57f7bf5f053,user.update,system.user,user,SUCCESS,200,40b5c2fb-7a2f-4af2-ac03-fad1bb3fe061,req-4fda5e87cd,2026-02-15T11:45:00.000Z',
        total: 1,
      },
    },
  })
  @ApiDefaultErrors({
    path: '/api/v1/audit/export',
    badRequest: {
      message: ['to must be a valid ISO 8601 date string'],
      error: 'Bad Request',
      statusCode: 400,
    },
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  export(@Query() dto: AuditQueryDto) {
    return this.exportAuditUseCase.execute(dto);
  }
}
