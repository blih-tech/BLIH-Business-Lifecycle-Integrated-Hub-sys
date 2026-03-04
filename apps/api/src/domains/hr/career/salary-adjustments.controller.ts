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
  ApproveSalaryAdjustmentRequestDto,
  CreateSalaryAdjustmentRequestDto,
  RejectSalaryAdjustmentRequestDto,
  UpdateSalaryAdjustmentRequestDto,
} from '@repo/types';
import { SalaryAdjustmentPermissions } from '../../../core/rbac/constants/permissions.constants';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { ApiProtected } from '../../../shared/docs/openapi';
import { KeycloakAuthGuard } from '../../../shared/guards/keycloak-auth.guard';
import { RbacGuard } from '../../../shared/guards/rbac.guard';
import { SalaryAdjustmentService } from './salary-adjustment.service';

@ApiTags('HR Salary Adjustments')
@Controller('hr/salary-adjustments')
@UseGuards(KeycloakAuthGuard, RbacGuard)
export class SalaryAdjustmentsController {
  constructor(private readonly service: SalaryAdjustmentService) {}

  @Get()
  @Roles(SalaryAdjustmentPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/salary-adjustments',
    roles: [SalaryAdjustmentPermissions.VIEW],
  })
  @ApiOperation({ summary: 'List salary adjustment requests' })
  @ApiOkResponse({ description: 'Salary adjustment request list' })
  list(
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: string,
    @Query('reason') reason?: string,
  ) {
    return this.service.list({ employeeId, status, reason });
  }

  @Post()
  @Roles(SalaryAdjustmentPermissions.CREATE)
  @ApiProtected({
    path: '/api/v1/hr/salary-adjustments',
    roles: [SalaryAdjustmentPermissions.CREATE],
  })
  @ApiOperation({ summary: 'Create salary adjustment request' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiOkResponse({ description: 'Created salary adjustment request' })
  create(@Body() body: CreateSalaryAdjustmentRequestDto) {
    return this.service.create(body);
  }

  @Get(':id')
  @Roles(SalaryAdjustmentPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/salary-adjustments/:id',
    roles: [SalaryAdjustmentPermissions.VIEW],
  })
  @ApiOperation({ summary: 'Get salary adjustment request' })
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ description: 'Salary adjustment request details' })
  get(@Param('id') id: string) {
    return this.service.get(id);
  }

  @Patch(':id')
  @Roles(SalaryAdjustmentPermissions.UPDATE)
  @ApiProtected({
    path: '/api/v1/hr/salary-adjustments/:id',
    roles: [SalaryAdjustmentPermissions.UPDATE],
  })
  @ApiOperation({ summary: 'Update draft salary adjustment request' })
  @ApiParam({ name: 'id' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiOkResponse({ description: 'Updated salary adjustment request' })
  update(
    @Param('id') id: string,
    @Body() body: UpdateSalaryAdjustmentRequestDto,
  ) {
    return this.service.update(id, body);
  }

  @Post(':id/submit')
  @Roles(SalaryAdjustmentPermissions.CREATE)
  @ApiProtected({
    path: '/api/v1/hr/salary-adjustments/:id/submit',
    roles: [SalaryAdjustmentPermissions.CREATE],
  })
  @ApiOperation({ summary: 'Submit salary adjustment request' })
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ description: 'Submitted salary adjustment request' })
  submit(@Param('id') id: string) {
    return this.service.submit(id);
  }

  @Post(':id/approve')
  @Roles(SalaryAdjustmentPermissions.APPROVE)
  @ApiProtected({
    path: '/api/v1/hr/salary-adjustments/:id/approve',
    roles: [SalaryAdjustmentPermissions.APPROVE],
  })
  @ApiOperation({ summary: 'Approve salary adjustment request' })
  @ApiParam({ name: 'id' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiOkResponse({ description: 'Approved salary adjustment request' })
  approve(
    @Param('id') id: string,
    @Body() body: ApproveSalaryAdjustmentRequestDto,
  ) {
    return this.service.approve(id, body);
  }

  @Post(':id/reject')
  @Roles(SalaryAdjustmentPermissions.REJECT)
  @ApiProtected({
    path: '/api/v1/hr/salary-adjustments/:id/reject',
    roles: [SalaryAdjustmentPermissions.REJECT],
  })
  @ApiOperation({ summary: 'Reject salary adjustment request' })
  @ApiParam({ name: 'id' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiOkResponse({ description: 'Rejected salary adjustment request' })
  reject(
    @Param('id') id: string,
    @Body() body: RejectSalaryAdjustmentRequestDto & { approvedById: string },
  ) {
    return this.service.reject(id, body, body.approvedById);
  }
}
