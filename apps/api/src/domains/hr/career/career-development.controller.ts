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
  CreateCareerDevelopmentPlanDto,
  UpdateCareerDevelopmentPlanDto,
  UpdateCareerDevelopmentProgressDto,
} from '@repo/types';
import { CareerDevelopmentPermissions } from '@repo/types/rbac';
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
import { CareerDevelopmentService } from './career-development.service';

@ApiTags('HR Career Development')
@Controller('hr/career-development-plans')
@UseGuards(KeycloakAuthGuard, RbacGuard)
export class CareerDevelopmentController {
  constructor(private readonly service: CareerDevelopmentService) {}

  @Get()
  @Roles(CareerDevelopmentPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/career-development-plans',
    roles: [CareerDevelopmentPermissions.VIEW],
  })
  @ApiOperation({ summary: 'List career development plans' })
  @ApiEnvelopeArrayResponse(
    GenericEntityResponseDto,
    'Career development plan list',
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/career-development-plans',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  list(
    @Query('employeeId') employeeId?: string,
    @Query('planYear') planYear?: string,
    @Query('status') status?: string,
  ) {
    return this.service.list({
      employeeId,
      planYear: planYear != null ? parseInt(planYear, 10) : undefined,
      status,
    });
  }

  @Post()
  @Roles(CareerDevelopmentPermissions.CREATE)
  @ApiProtected({
    path: '/api/v1/hr/career-development-plans',
    roles: [CareerDevelopmentPermissions.CREATE],
  })
  @ApiOperation({ summary: 'Create career development plan' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiEnvelopeOkResponse(
    GenericEntityResponseDto,
    'Created career development plan',
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/career-development-plans',
    badRequest: 'Career development plan payload is invalid',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  create(@Body() body: CreateCareerDevelopmentPlanDto) {
    return this.service.create(body);
  }

  @Get(':id')
  @Roles(CareerDevelopmentPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/career-development-plans/:id',
    roles: [CareerDevelopmentPermissions.VIEW],
  })
  @ApiOperation({ summary: 'Get career development plan' })
  @ApiParam({ name: 'id' })
  @ApiEnvelopeOkResponse(
    GenericEntityResponseDto,
    'Career development plan details',
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/career-development-plans/:id',
    notFound: 'Career development plan not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  get(@Param('id') id: string) {
    return this.service.get(id);
  }

  @Patch(':id')
  @Roles(CareerDevelopmentPermissions.UPDATE)
  @ApiProtected({
    path: '/api/v1/hr/career-development-plans/:id',
    roles: [CareerDevelopmentPermissions.UPDATE],
  })
  @ApiOperation({ summary: 'Update career development plan' })
  @ApiParam({ name: 'id' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiEnvelopeOkResponse(
    GenericEntityResponseDto,
    'Updated career development plan',
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/career-development-plans/:id',
    badRequest: 'Career development plan payload is invalid',
    notFound: 'Career development plan not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  update(
    @Param('id') id: string,
    @Body() body: UpdateCareerDevelopmentPlanDto,
  ) {
    return this.service.update(id, body);
  }

  @Post(':id/progress')
  @Roles(CareerDevelopmentPermissions.UPDATE)
  @ApiProtected({
    path: '/api/v1/hr/career-development-plans/:id/progress',
    roles: [CareerDevelopmentPermissions.UPDATE],
  })
  @ApiOperation({ summary: 'Update career development progress' })
  @ApiParam({ name: 'id' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiEnvelopeOkResponse(
    GenericEntityResponseDto,
    'Updated career development plan progress',
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/career-development-plans/:id/progress',
    badRequest: 'Career development progress payload is invalid',
    notFound: 'Career development plan not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  updateProgress(
    @Param('id') id: string,
    @Body() body: UpdateCareerDevelopmentProgressDto,
  ) {
    return this.service.updateProgress(id, body);
  }
}
