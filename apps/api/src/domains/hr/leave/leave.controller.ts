import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { CreateLeaveRequestDto, RejectLeaveRequestDto } from '@blih/types';
import type { Request } from 'express';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { LeavePermissions } from '../../../core/rbac/constants/permissions.constants';
import { ApiProtected } from '../../../shared/docs/openapi';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { KeycloakAuthGuard } from '../../../shared/guards/keycloak-auth.guard';
import { RbacGuard } from '../../../shared/guards/rbac.guard';
import { ApproveLeaveRequestUseCase } from './use-cases/approve-leave-request.usecase';
import { CreateLeaveRequestUseCase } from './use-cases/create-leave-request.usecase';
import { GetLeaveBalanceUseCase } from './use-cases/get-leave-balance.usecase';
import { GetLeaveRequestUseCase } from './use-cases/get-leave-request.usecase';
import { ListLeaveRequestsUseCase } from './use-cases/list-leave-requests.usecase';
import { RejectLeaveRequestUseCase } from './use-cases/reject-leave-request.usecase';
import { SubmitLeaveRequestUseCase } from './use-cases/submit-leave-request.usecase';

@ApiTags('HR Leave')
@Controller('hr/leave')
@UseGuards(KeycloakAuthGuard, RbacGuard)
export class LeaveController {
  constructor(
    private readonly createUseCase: CreateLeaveRequestUseCase,
    private readonly listUseCase: ListLeaveRequestsUseCase,
    private readonly getUseCase: GetLeaveRequestUseCase,
    private readonly submitUseCase: SubmitLeaveRequestUseCase,
    private readonly approveUseCase: ApproveLeaveRequestUseCase,
    private readonly rejectUseCase: RejectLeaveRequestUseCase,
    private readonly getBalanceUseCase: GetLeaveBalanceUseCase,
  ) {}

  @Post('requests')
  @Roles(LeavePermissions.CREATE)
  @ApiProtected({
    path: '/api/v1/hr/leave/requests',
    roles: [LeavePermissions.CREATE],
  })
  @ApiOperation({ summary: 'Create leave request (draft or submit)' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiOkResponse({ description: 'Created leave request' })
  create(@Body() body: CreateLeaveRequestDto) {
    return this.createUseCase.execute(body);
  }

  @Get('requests')
  @Roles(LeavePermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/leave/requests',
    roles: [LeavePermissions.VIEW],
  })
  @ApiOperation({ summary: 'List leave requests' })
  @ApiOkResponse({ description: 'List of leave requests' })
  list(@Query('userId') userId?: string, @Query('status') status?: string) {
    return this.listUseCase.execute({ userId, status });
  }

  @Get('requests/:id')
  @Roles(LeavePermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/leave/requests/:id',
    roles: [LeavePermissions.VIEW],
  })
  @ApiOperation({ summary: 'Get leave request' })
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ description: 'Leave request details' })
  get(@Param('id') id: string) {
    return this.getUseCase.execute(id);
  }

  @Post('requests/:id/submit')
  @Roles(LeavePermissions.CREATE)
  @ApiProtected({
    path: '/api/v1/hr/leave/requests/:id/submit',
    roles: [LeavePermissions.CREATE],
  })
  @ApiOperation({ summary: 'Submit leave request for approval' })
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ description: 'Submitted' })
  submit(@Param('id') id: string) {
    return this.submitUseCase.execute(id);
  }

  @Post('requests/:id/approve')
  @Roles(LeavePermissions.APPROVE)
  @ApiProtected({
    path: '/api/v1/hr/leave/requests/:id/approve',
    roles: [LeavePermissions.APPROVE],
  })
  @ApiOperation({ summary: 'Approve leave request' })
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ description: 'Approved' })
  approve(@Param('id') id: string, @Req() req: Request) {
    return this.approveUseCase.execute(id, req as never);
  }

  @Post('requests/:id/reject')
  @Roles(LeavePermissions.REJECT)
  @ApiProtected({
    path: '/api/v1/hr/leave/requests/:id/reject',
    roles: [LeavePermissions.REJECT],
  })
  @ApiOperation({ summary: 'Reject leave request' })
  @ApiParam({ name: 'id' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiOkResponse({ description: 'Rejected' })
  reject(
    @Param('id') id: string,
    @Body() body: RejectLeaveRequestDto,
    @Req() req: Request,
  ) {
    return this.rejectUseCase.execute(id, body, req as never);
  }

  @Get('balance')
  @Roles(LeavePermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/leave/balance',
    roles: [LeavePermissions.VIEW],
  })
  @ApiOperation({ summary: 'Get leave balance for user' })
  @ApiOkResponse({ description: 'Leave balance by type' })
  balance(
    @Query('userId') userId: string | undefined,
    @Query('leaveType') leaveType?: string,
  ) {
    if (!userId) {
      throw new BadRequestException('Query parameter userId is required');
    }
    return this.getBalanceUseCase.execute(userId, leaveType);
  }
}
