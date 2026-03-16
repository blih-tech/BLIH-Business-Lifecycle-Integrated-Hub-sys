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
  CreateCertificationDto,
  RenewCertificationDto,
  UpdateCertificationDto,
} from '@repo/types';
import { CertificationPermissions } from '@repo/types/rbac';
import { Roles } from '../../../shared/decorators/roles.decorator';
import {
  ApiDefaultErrors,
  ApiEnvelopeArrayResponse,
  ApiEnvelopeOkResponse,
  ApiProtected,
  GenericEntityResponseDto,
} from '../../../shared/docs/openapi';
import { KeycloakAuthGuard } from '../../../shared/guards/keycloak-auth.guard';
import { RbacGuard } from '../../../shared/guards/rbac.guard';
import { TrainingCertificationService } from './training-certification.service';

@ApiTags('HR Training Certifications')
@Controller('hr/training/certifications')
@UseGuards(KeycloakAuthGuard, RbacGuard)
export class TrainingCertificationsController {
  constructor(private readonly service: TrainingCertificationService) {}

  @Get('expiring')
  @Roles(CertificationPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/training/certifications/expiring',
    roles: [CertificationPermissions.VIEW],
  })
  @ApiOperation({ summary: 'List expiring certifications' })
  @ApiEnvelopeArrayResponse(GenericEntityResponseDto, 'Expiring certifications')
  @ApiDefaultErrors({
    path: '/api/v1/hr/training/certifications/expiring',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  listExpiring(
    @Query('employeeId') employeeId?: string,
    @Query('days') days?: string,
  ) {
    return this.service.list({
      employeeId,
      expiringWithinDays: days != null ? parseInt(days, 10) : 30,
    });
  }

  @Get()
  @Roles(CertificationPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/training/certifications',
    roles: [CertificationPermissions.VIEW],
  })
  @ApiOperation({ summary: 'List certifications' })
  @ApiEnvelopeArrayResponse(GenericEntityResponseDto, 'Certification list')
  @ApiDefaultErrors({
    path: '/api/v1/hr/training/certifications',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  list(
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: string,
    @Query('expiringWithinDays') expiringWithinDays?: string,
  ) {
    return this.service.list({
      employeeId,
      status,
      expiringWithinDays:
        expiringWithinDays != null
          ? parseInt(expiringWithinDays, 10)
          : undefined,
    });
  }

  @Post()
  @Roles(CertificationPermissions.CREATE)
  @ApiProtected({
    path: '/api/v1/hr/training/certifications',
    roles: [CertificationPermissions.CREATE],
  })
  @ApiOperation({ summary: 'Create certification record' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiEnvelopeOkResponse(
    GenericEntityResponseDto,
    'Created certification record',
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/training/certifications',
    badRequest: 'Certification payload is invalid',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  create(@Body() body: CreateCertificationDto) {
    return this.service.create(body);
  }

  @Get(':id')
  @Roles(CertificationPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/training/certifications/:id',
    roles: [CertificationPermissions.VIEW],
  })
  @ApiOperation({ summary: 'Get certification' })
  @ApiParam({ name: 'id' })
  @ApiEnvelopeOkResponse(GenericEntityResponseDto, 'Certification details')
  @ApiDefaultErrors({
    path: '/api/v1/hr/training/certifications/:id',
    notFound: 'Certification not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  get(@Param('id') id: string) {
    return this.service.get(id);
  }

  @Patch(':id')
  @Roles(CertificationPermissions.UPDATE)
  @ApiProtected({
    path: '/api/v1/hr/training/certifications/:id',
    roles: [CertificationPermissions.UPDATE],
  })
  @ApiOperation({ summary: 'Update certification' })
  @ApiParam({ name: 'id' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiEnvelopeOkResponse(GenericEntityResponseDto, 'Updated certification')
  @ApiDefaultErrors({
    path: '/api/v1/hr/training/certifications/:id',
    badRequest: 'Certification payload is invalid',
    notFound: 'Certification not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  update(@Param('id') id: string, @Body() body: UpdateCertificationDto) {
    return this.service.update(id, body);
  }

  @Post(':id/renew')
  @Roles(CertificationPermissions.RENEW)
  @ApiProtected({
    path: '/api/v1/hr/training/certifications/:id/renew',
    roles: [CertificationPermissions.RENEW],
  })
  @ApiOperation({ summary: 'Renew certification' })
  @ApiParam({ name: 'id' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiEnvelopeOkResponse(GenericEntityResponseDto, 'Renewed certification')
  @ApiDefaultErrors({
    path: '/api/v1/hr/training/certifications/:id/renew',
    badRequest: 'Certification renewal payload is invalid',
    notFound: 'Certification not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  renew(@Param('id') id: string, @Body() body: RenewCertificationDto) {
    return this.service.renew(id, body);
  }
}
