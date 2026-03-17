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
  CreateResignationDto,
  UpdateResignationDto,
  CreateExitInterviewDto,
  CreateFinalSettlementDto,
  UpdateFinalSettlementDto,
  CreateAssetReturnDto,
  UpdateAssetReturnDto,
  CreateComplianceChecklistDto,
  UpdateComplianceChecklistDto,
  CompleteOffboardingTaskDto,
} from '@repo/types';
import { OffboardingPermissions } from '../../../core/rbac/constants/permissions.constants';
import { ApiProtected } from '../../../shared/docs/openapi';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { KeycloakAuthGuard } from '../../../shared/guards/keycloak-auth.guard';
import { RbacGuard } from '../../../shared/guards/rbac.guard';
import { CreateResignationUseCase } from './use-cases/create-resignation.usecase';
import { ListResignationsUseCase } from './use-cases/list-resignations.usecase';
import { GetResignationUseCase } from './use-cases/get-resignation.usecase';
import { UpdateResignationUseCase } from './use-cases/update-resignation.usecase';
import { GenerateOffboardingChecklistUseCase } from './use-cases/generate-offboarding-checklist.usecase';
import { GetOffboardingChecklistUseCase } from './use-cases/get-offboarding-checklist.usecase';
import { CompleteOffboardingTaskUseCase } from './use-cases/complete-offboarding-task.usecase';
import { CreateExitInterviewUseCase } from './use-cases/create-exit-interview.usecase';
import { ListExitInterviewsUseCase } from './use-cases/list-exit-interviews.usecase';
import { CreateFinalSettlementUseCase } from './use-cases/create-final-settlement.usecase';
import { GetFinalSettlementUseCase } from './use-cases/get-final-settlement.usecase';
import { UpdateFinalSettlementUseCase } from './use-cases/update-final-settlement.usecase';
import { CreateAssetReturnUseCase } from './use-cases/create-asset-return.usecase';
import { UpdateAssetReturnUseCase } from './use-cases/update-asset-return.usecase';
import { CreateComplianceChecklistUseCase } from './use-cases/create-compliance-checklist.usecase';
import { UpdateComplianceChecklistUseCase } from './use-cases/update-compliance-checklist.usecase';
import { CompleteOffboardingUseCase } from './use-cases/complete-offboarding.usecase';

@ApiTags('HR Offboarding')
@Controller('hr/offboarding')
@UseGuards(KeycloakAuthGuard, RbacGuard)
export class OffboardingController {
  constructor(
    private readonly createResignation: CreateResignationUseCase,
    private readonly listResignations: ListResignationsUseCase,
    private readonly getResignation: GetResignationUseCase,
    private readonly updateResignation: UpdateResignationUseCase,
    private readonly generateChecklist: GenerateOffboardingChecklistUseCase,
    private readonly getChecklist: GetOffboardingChecklistUseCase,
    private readonly completeTask: CompleteOffboardingTaskUseCase,
    private readonly createExitInterview: CreateExitInterviewUseCase,
    private readonly listExitInterviews: ListExitInterviewsUseCase,
    private readonly createFinalSettlement: CreateFinalSettlementUseCase,
    private readonly getFinalSettlement: GetFinalSettlementUseCase,
    private readonly updateFinalSettlement: UpdateFinalSettlementUseCase,
    private readonly createAssetReturn: CreateAssetReturnUseCase,
    private readonly updateAssetReturn: UpdateAssetReturnUseCase,
    private readonly createCompliance: CreateComplianceChecklistUseCase,
    private readonly updateCompliance: UpdateComplianceChecklistUseCase,
    private readonly completeOffboarding: CompleteOffboardingUseCase,
  ) {}

  @Post('resignations')
  @Roles(OffboardingPermissions.CREATE)
  @ApiProtected({
    path: '/api/v1/hr/offboarding/resignations',
    roles: [OffboardingPermissions.CREATE],
  })
  @ApiOperation({ summary: 'Submit resignation (validate notice)' })
  @ApiBody({ schema: { type: 'object' } })
  createResignationHandler(@Body() body: CreateResignationDto) {
    return this.createResignation.execute(body);
  }

  @Get('resignations')
  @Roles(OffboardingPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/offboarding/resignations',
    roles: [OffboardingPermissions.VIEW],
  })
  @ApiOperation({ summary: 'List resignations' })
  listResignationsHandler(
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: string,
  ) {
    return this.listResignations.execute({ employeeId, status });
  }

  @Get('resignations/:id')
  @Roles(OffboardingPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/offboarding/resignations/:id',
    roles: [OffboardingPermissions.VIEW],
  })
  @ApiOperation({ summary: 'Get resignation' })
  @ApiParam({ name: 'id' })
  getResignationHandler(@Param('id') id: string) {
    return this.getResignation.execute(id);
  }

  @Patch('resignations/:id')
  @Roles(OffboardingPermissions.UPDATE)
  @ApiProtected({
    path: '/api/v1/hr/offboarding/resignations/:id',
    roles: [OffboardingPermissions.UPDATE],
  })
  @ApiOperation({ summary: 'Update resignation; approve last day' })
  @ApiParam({ name: 'id' })
  @ApiBody({ schema: { type: 'object' } })
  updateResignationHandler(
    @Param('id') id: string,
    @Body() body: UpdateResignationDto,
  ) {
    return this.updateResignation.execute(id, body);
  }

  @Post('resignations/:id/checklist')
  @Roles(OffboardingPermissions.CREATE)
  @ApiProtected({
    path: '/api/v1/hr/offboarding/resignations/:id/checklist',
    roles: [OffboardingPermissions.CREATE],
  })
  @ApiOperation({ summary: 'Generate offboarding checklist from matrix' })
  @ApiParam({ name: 'id' })
  generateChecklistHandler(@Param('id') id: string) {
    return this.generateChecklist.execute(id);
  }

  @Get('checklists/:id')
  @Roles(OffboardingPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/offboarding/checklists/:id',
    roles: [OffboardingPermissions.VIEW],
  })
  @ApiOperation({ summary: 'Get checklist with tasks' })
  @ApiParam({ name: 'id' })
  getChecklistHandler(@Param('id') id: string) {
    return this.getChecklist.execute(id);
  }

  @Patch('checklists/:id/tasks/:taskId')
  @Roles(OffboardingPermissions.UPDATE)
  @ApiProtected({
    path: '/api/v1/hr/offboarding/checklists/:id/tasks/:taskId',
    roles: [OffboardingPermissions.UPDATE],
  })
  @ApiOperation({ summary: 'Complete task' })
  @ApiParam({ name: 'id' })
  @ApiParam({ name: 'taskId' })
  @ApiBody({ schema: { type: 'object' } })
  completeTaskHandler(
    @Param('id') id: string,
    @Param('taskId') taskId: string,
    @Body() body: CompleteOffboardingTaskDto,
  ) {
    return this.completeTask.execute(id, taskId, body);
  }

  @Post('exit-interviews')
  @Roles(OffboardingPermissions.CREATE)
  @ApiProtected({
    path: '/api/v1/hr/offboarding/exit-interviews',
    roles: [OffboardingPermissions.CREATE],
  })
  @ApiOperation({ summary: 'Record exit interview' })
  @ApiBody({ schema: { type: 'object' } })
  createExitInterviewHandler(@Body() body: CreateExitInterviewDto) {
    return this.createExitInterview.execute(body);
  }

  @Get('exit-interviews')
  @Roles(OffboardingPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/offboarding/exit-interviews',
    roles: [OffboardingPermissions.VIEW],
  })
  @ApiOperation({ summary: 'List exit interviews' })
  listExitInterviewsHandler(
    @Query('employeeId') employeeId?: string,
    @Query('resignationId') resignationId?: string,
  ) {
    return this.listExitInterviews.execute({ employeeId, resignationId });
  }

  @Post('final-settlements')
  @Roles(OffboardingPermissions.CREATE)
  @ApiProtected({
    path: '/api/v1/hr/offboarding/final-settlements',
    roles: [OffboardingPermissions.CREATE],
  })
  @ApiOperation({ summary: 'Create settlement (calculate from rules)' })
  @ApiBody({ schema: { type: 'object' } })
  createFinalSettlementHandler(@Body() body: CreateFinalSettlementDto) {
    return this.createFinalSettlement.execute(body);
  }

  @Get('final-settlements/:id')
  @Roles(OffboardingPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/offboarding/final-settlements/:id',
    roles: [OffboardingPermissions.VIEW],
  })
  @ApiOperation({ summary: 'Get settlement breakdown' })
  @ApiParam({ name: 'id' })
  getFinalSettlementHandler(@Param('id') id: string) {
    return this.getFinalSettlement.execute(id);
  }

  @Patch('final-settlements/:id')
  @Roles(OffboardingPermissions.APPROVE)
  @ApiProtected({
    path: '/api/v1/hr/offboarding/final-settlements/:id',
    roles: [OffboardingPermissions.APPROVE],
  })
  @ApiOperation({ summary: 'Approve; mark paid' })
  @ApiParam({ name: 'id' })
  @ApiBody({ schema: { type: 'object' } })
  updateFinalSettlementHandler(
    @Param('id') id: string,
    @Body() body: UpdateFinalSettlementDto,
  ) {
    return this.updateFinalSettlement.execute(id, body);
  }

  @Post('asset-returns')
  @Roles(OffboardingPermissions.CREATE)
  @ApiProtected({
    path: '/api/v1/hr/offboarding/asset-returns',
    roles: [OffboardingPermissions.CREATE],
  })
  @ApiOperation({ summary: 'Record asset return' })
  @ApiBody({ schema: { type: 'object' } })
  createAssetReturnHandler(@Body() body: CreateAssetReturnDto) {
    return this.createAssetReturn.execute(body);
  }

  @Patch('asset-returns/:id')
  @Roles(OffboardingPermissions.UPDATE)
  @ApiProtected({
    path: '/api/v1/hr/offboarding/asset-returns/:id',
    roles: [OffboardingPermissions.UPDATE],
  })
  @ApiOperation({ summary: 'Sign-off by IT/Admin/Finance' })
  @ApiParam({ name: 'id' })
  @ApiBody({ schema: { type: 'object' } })
  updateAssetReturnHandler(
    @Param('id') id: string,
    @Body() body: UpdateAssetReturnDto,
  ) {
    return this.updateAssetReturn.execute(id, body);
  }

  @Post('compliance-checklists')
  @Roles(OffboardingPermissions.CREATE)
  @ApiProtected({
    path: '/api/v1/hr/offboarding/compliance-checklists',
    roles: [OffboardingPermissions.CREATE],
  })
  @ApiOperation({ summary: 'Create compliance checklist' })
  @ApiBody({ schema: { type: 'object' } })
  createComplianceHandler(@Body() body: CreateComplianceChecklistDto) {
    return this.createCompliance.execute(body);
  }

  @Patch('compliance-checklists/:id')
  @Roles(OffboardingPermissions.UPDATE)
  @ApiProtected({
    path: '/api/v1/hr/offboarding/compliance-checklists/:id',
    roles: [OffboardingPermissions.UPDATE],
  })
  @ApiOperation({ summary: 'Verify and sign off' })
  @ApiParam({ name: 'id' })
  @ApiBody({ schema: { type: 'object' } })
  updateComplianceHandler(
    @Param('id') id: string,
    @Body() body: UpdateComplianceChecklistDto,
  ) {
    return this.updateCompliance.execute(id, body);
  }

  @Post('resignations/:id/complete')
  @Roles(OffboardingPermissions.COMPLETE)
  @ApiProtected({
    path: '/api/v1/hr/offboarding/resignations/:id/complete',
    roles: [OffboardingPermissions.COMPLETE],
  })
  @ApiOperation({ summary: 'Mark offboarding complete; set lifecycle' })
  @ApiParam({ name: 'id' })
  completeOffboardingHandler(@Param('id') id: string) {
    return this.completeOffboarding.execute(id);
  }
}
