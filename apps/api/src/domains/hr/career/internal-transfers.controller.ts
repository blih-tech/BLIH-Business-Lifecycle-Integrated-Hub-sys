import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import type {
  ApproveInternalTransferRequestDto,
  CreateInternalTransferRequestDto,
  RejectInternalTransferRequestDto,
  UpdateInternalTransferRequestDto,
} from '@repo/types';
import { InternalTransferPermissions } from '../../../core/rbac/constants/permissions.constants';
import { Roles } from '../../../shared/decorators/roles.decorator';
import {
  ApiDefaultErrors,
  ApiEnvelopeArrayResponse,
  ApiEnvelopeOkResponse,
  ApiProtected,
} from '../../../shared/docs/openapi';
import { KeycloakAuthGuard } from '../../../shared/guards/keycloak-auth.guard';
import { RbacGuard } from '../../../shared/guards/rbac.guard';
import { InternalTransferRequestResponseDto } from './dto/career-response.dto';
import { InternalTransferService } from './internal-transfer.service';

@ApiTags('HR Internal Transfers')
@Controller('hr/internal-transfers')
@UseGuards(KeycloakAuthGuard, RbacGuard)
export class InternalTransfersController {
  constructor(private readonly service: InternalTransferService) {}

  @Get()
  @Roles(InternalTransferPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/internal-transfers',
    roles: [InternalTransferPermissions.VIEW],
  })
  @ApiOperation({ summary: 'List internal transfer requests' })
  @ApiEnvelopeArrayResponse(
    InternalTransferRequestResponseDto,
    'Internal transfer request list',
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/internal-transfers',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  list(
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: string,
    @Query('requestType') requestType?: string,
  ) {
    return this.service.list({ employeeId, status, requestType });
  }

  @Post()
  @Roles(InternalTransferPermissions.CREATE)
  @ApiProtected({
    path: '/api/v1/hr/internal-transfers',
    roles: [InternalTransferPermissions.CREATE],
  })
  @ApiOperation({ summary: 'Create internal transfer request' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiEnvelopeOkResponse(
    InternalTransferRequestResponseDto,
    'Created internal transfer request',
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/internal-transfers',
    badRequest: 'Internal transfer payload is invalid',
    notFound: 'Employee, requester, or target position not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  create(@Body() body: CreateInternalTransferRequestDto) {
    return this.service.create(body);
  }

  @Get(':id')
  @Roles(InternalTransferPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/internal-transfers/:id',
    roles: [InternalTransferPermissions.VIEW],
  })
  @ApiOperation({ summary: 'Get internal transfer request' })
  @ApiParam({ name: 'id' })
  @ApiEnvelopeOkResponse(
    InternalTransferRequestResponseDto,
    'Internal transfer request details',
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/internal-transfers/:id',
    notFound: 'Internal transfer request not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  get(@Param('id') id: string) {
    return this.service.get(id);
  }

  @Patch(':id')
  @Roles(InternalTransferPermissions.UPDATE)
  @ApiProtected({
    path: '/api/v1/hr/internal-transfers/:id',
    roles: [InternalTransferPermissions.UPDATE],
  })
  @ApiOperation({ summary: 'Update draft internal transfer request' })
  @ApiParam({ name: 'id' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiEnvelopeOkResponse(
    InternalTransferRequestResponseDto,
    'Updated internal transfer request',
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/internal-transfers/:id',
    badRequest: 'Internal transfer payload is invalid',
    notFound: 'Internal transfer request not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  update(
    @Param('id') id: string,
    @Body() body: UpdateInternalTransferRequestDto,
  ) {
    return this.service.update(id, body);
  }

  @Post(':id/submit')
  @Roles(InternalTransferPermissions.CREATE)
  @ApiProtected({
    path: '/api/v1/hr/internal-transfers/:id/submit',
    roles: [InternalTransferPermissions.CREATE],
  })
  @ApiOperation({ summary: 'Submit internal transfer request' })
  @ApiParam({ name: 'id' })
  @ApiEnvelopeOkResponse(
    InternalTransferRequestResponseDto,
    'Submitted internal transfer request',
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/internal-transfers/:id/submit',
    badRequest:
      'Internal transfer request cannot be submitted in its current state',
    notFound: 'Internal transfer request not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  submit(@Param('id') id: string) {
    return this.service.submit(id);
  }

  @Post(':id/approve')
  @Roles(InternalTransferPermissions.APPROVE)
  @ApiProtected({
    path: '/api/v1/hr/internal-transfers/:id/approve',
    roles: [InternalTransferPermissions.APPROVE],
  })
  @ApiOperation({ summary: 'Approve internal transfer request' })
  @ApiParam({ name: 'id' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiEnvelopeOkResponse(
    InternalTransferRequestResponseDto,
    'Approved internal transfer request',
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/internal-transfers/:id/approve',
    badRequest:
      'Internal transfer request cannot be approved in its current state',
    notFound: 'Internal transfer request not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  approve(
    @Param('id') id: string,
    @Body() body: ApproveInternalTransferRequestDto,
  ) {
    return this.service.approve(id, body);
  }

  @Post(':id/reject')
  @Roles(InternalTransferPermissions.REJECT)
  @ApiProtected({
    path: '/api/v1/hr/internal-transfers/:id/reject',
    roles: [InternalTransferPermissions.REJECT],
  })
  @ApiOperation({ summary: 'Reject internal transfer request' })
  @ApiParam({ name: 'id' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiEnvelopeOkResponse(
    InternalTransferRequestResponseDto,
    'Rejected internal transfer request',
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/internal-transfers/:id/reject',
    badRequest: 'Internal transfer rejection payload is invalid',
    notFound: 'Internal transfer request not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  reject(
    @Param('id') id: string,
    @Body() body: RejectInternalTransferRequestDto & { approvedById: string },
  ) {
    return this.service.reject(id, body, body.approvedById);
  }
}
