import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type {
  CreateLeaveRequestDto,
  RejectLeaveRequestDto,
  UpdateLeaveRequestDto,
} from '@repo/types';
import type { Request } from 'express';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { LeavePermissions } from '../../../core/rbac/constants/permissions.constants';
import {
  ApiDefaultErrors,
  ApiEnvelopeArrayResponse,
  ApiEnvelopeOkResponse,
  ApiProtected,
} from '../../../shared/docs/openapi';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { KeycloakAuthGuard } from '../../../shared/guards/keycloak-auth.guard';
import { RbacGuard } from '../../../shared/guards/rbac.guard';
import {
  LeaveBalanceDto,
  LeaveRequestResponseDto,
} from './dto/leave-response.dto';
import { ApproveLeaveRequestUseCase } from './use-cases/approve-leave-request.usecase';
import { CreateLeaveRequestUseCase } from './use-cases/create-leave-request.usecase';
import { GetLeaveBalanceUseCase } from './use-cases/get-leave-balance.usecase';
import { GetLeaveRequestUseCase } from './use-cases/get-leave-request.usecase';
import { ListLeaveRequestsUseCase } from './use-cases/list-leave-requests.usecase';
import { RejectLeaveRequestUseCase } from './use-cases/reject-leave-request.usecase';
import { SubmitLeaveRequestUseCase } from './use-cases/submit-leave-request.usecase';
import { UpdateLeaveRequestUseCase } from './use-cases/update-leave-request.usecase';
import { CancelLeaveRequestUseCase } from './use-cases/cancel-leave-request.usecase';

@ApiTags('HR Leave')
@Controller('hr/leave')
@UseGuards(KeycloakAuthGuard, RbacGuard)
export class LeaveController {
  constructor(
    private readonly createUseCase: CreateLeaveRequestUseCase,
    private readonly listUseCase: ListLeaveRequestsUseCase,
    private readonly getUseCase: GetLeaveRequestUseCase,
    private readonly updateUseCase: UpdateLeaveRequestUseCase,
    private readonly submitUseCase: SubmitLeaveRequestUseCase,
    private readonly approveUseCase: ApproveLeaveRequestUseCase,
    private readonly rejectUseCase: RejectLeaveRequestUseCase,
    private readonly cancelUseCase: CancelLeaveRequestUseCase,
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
  @ApiEnvelopeOkResponse(LeaveRequestResponseDto, 'Created leave request')
  @ApiDefaultErrors({
    path: '/api/v1/hr/leave/requests',
    badRequest: 'Leave request payload is invalid',
    notFound: 'Employee or handover delegate not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
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
  @ApiEnvelopeArrayResponse(LeaveRequestResponseDto, 'List of leave requests')
  @ApiDefaultErrors({
    path: '/api/v1/hr/leave/requests',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  list(
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: string,
  ) {
    return this.listUseCase.execute({ employeeId, status });
  }

  @Get('requests/:id')
  @Roles(LeavePermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/leave/requests/:id',
    roles: [LeavePermissions.VIEW],
  })
  @ApiOperation({ summary: 'Get leave request' })
  @ApiParam({ name: 'id' })
  @ApiEnvelopeOkResponse(LeaveRequestResponseDto, 'Leave request details')
  @ApiDefaultErrors({
    path: '/api/v1/hr/leave/requests/:id',
    notFound: 'Leave request not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  get(@Param('id') id: string) {
    return this.getUseCase.execute(id);
  }

  @Patch('requests/:id')
  @Roles(LeavePermissions.CREATE)
  @ApiProtected({
    path: '/api/v1/hr/leave/requests/:id',
    roles: [LeavePermissions.CREATE],
  })
  @ApiOperation({ summary: 'Update draft leave request' })
  @ApiParam({ name: 'id' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiEnvelopeOkResponse(LeaveRequestResponseDto, 'Updated leave request')
  @ApiDefaultErrors({
    path: '/api/v1/hr/leave/requests/:id',
    badRequest: 'Leave request update is invalid',
    notFound: 'Leave request not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  update(@Param('id') id: string, @Body() body: UpdateLeaveRequestDto) {
    return this.updateUseCase.execute(id, body);
  }

  @Post('requests/:id/submit')
  @Roles(LeavePermissions.CREATE)
  @ApiProtected({
    path: '/api/v1/hr/leave/requests/:id/submit',
    roles: [LeavePermissions.CREATE],
  })
  @ApiOperation({ summary: 'Submit leave request for approval' })
  @ApiParam({ name: 'id' })
  @ApiEnvelopeOkResponse(LeaveRequestResponseDto, 'Submitted')
  @ApiDefaultErrors({
    path: '/api/v1/hr/leave/requests/:id/submit',
    badRequest: 'Leave request cannot be submitted in its current state',
    notFound: 'Leave request not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  submit(@Param('id') id: string) {
    return this.submitUseCase.execute(id);
  }

  @Post('requests/:id/cancel')
  @Roles(LeavePermissions.CREATE)
  @ApiProtected({
    path: '/api/v1/hr/leave/requests/:id/cancel',
    roles: [LeavePermissions.CREATE],
  })
  @ApiOperation({ summary: 'Cancel leave request' })
  @ApiParam({ name: 'id' })
  @ApiEnvelopeOkResponse(LeaveRequestResponseDto, 'Cancelled leave request')
  @ApiDefaultErrors({
    path: '/api/v1/hr/leave/requests/:id/cancel',
    badRequest: 'Leave request cannot be cancelled in its current state',
    notFound: 'Leave request not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  cancel(@Param('id') id: string) {
    return this.cancelUseCase.execute(id);
  }

  @Post('requests/:id/approve')
  @Roles(LeavePermissions.APPROVE)
  @ApiProtected({
    path: '/api/v1/hr/leave/requests/:id/approve',
    roles: [LeavePermissions.APPROVE],
  })
  @ApiOperation({ summary: 'Approve leave request' })
  @ApiParam({ name: 'id' })
  @ApiEnvelopeOkResponse(LeaveRequestResponseDto, 'Approved')
  @ApiDefaultErrors({
    path: '/api/v1/hr/leave/requests/:id/approve',
    badRequest: 'Leave request cannot be approved in its current state',
    notFound: 'Leave request not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
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
  @ApiEnvelopeOkResponse(LeaveRequestResponseDto, 'Rejected')
  @ApiDefaultErrors({
    path: '/api/v1/hr/leave/requests/:id/reject',
    badRequest: 'Leave request rejection payload is invalid',
    notFound: 'Leave request not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
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
  @ApiOperation({ summary: 'Get leave balance for employee' })
  @ApiEnvelopeArrayResponse(LeaveBalanceDto, 'Leave balance by type')
  @ApiDefaultErrors({
    path: '/api/v1/hr/leave/balance',
    badRequest: 'Query parameter employeeId is required',
    notFound: 'Employee not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  balance(
    @Query('employeeId') employeeId: string | undefined,
    @Query('leaveType') leaveType?: string,
  ) {
    if (!employeeId) {
      throw new BadRequestException('Query parameter employeeId is required');
    }
    return this.getBalanceUseCase.execute(employeeId, leaveType);
  }
}
