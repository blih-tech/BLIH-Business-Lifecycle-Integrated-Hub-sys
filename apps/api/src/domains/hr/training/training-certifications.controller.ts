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
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import type {
  CreateCertificationDto,
  RenewCertificationDto,
  UpdateCertificationDto,
} from '@repo/types';
import { CertificationPermissions } from '../../../core/rbac/constants/permissions.constants';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { ApiProtected } from '../../../shared/docs/openapi';
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
  @ApiOkResponse({ description: 'Certification list' })
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
  renew(@Param('id') id: string, @Body() body: RenewCertificationDto) {
    return this.service.renew(id, body);
  }
}
