import {
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
import type { Request } from 'express';
import type { AuthPrincipal } from '../../../shared/interfaces/auth-principal.interface';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import type {
  CreateIncidentReportDto,
  UpdateIncidentReportDto,
  CreateDisciplinaryActionDto,
  CreateGrievanceDto,
  UpdateGrievanceDto,
  CreateRecognitionDto,
  ApproveRecognitionDto,
  CreateSurveyDto,
  UpdateSurveyDto,
  SubmitSurveyResponseDto,
  CreateConflictMediationDto,
  UpdateConflictMediationDto,
} from '@repo/types';
import { RelationsPermissions } from '@repo/types/rbac';
import { ApiProtected } from '../../../shared/docs/openapi';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { KeycloakAuthGuard } from '../../../shared/guards/keycloak-auth.guard';
import { RbacGuard } from '../../../shared/guards/rbac.guard';
import { CreateIncidentReportUseCase } from './use-cases/create-incident-report.usecase';
import { ListIncidentReportsUseCase } from './use-cases/list-incident-reports.usecase';
import { GetIncidentReportUseCase } from './use-cases/get-incident-report.usecase';
import { UpdateIncidentReportUseCase } from './use-cases/update-incident-report.usecase';
import { CreateDisciplinaryActionUseCase } from './use-cases/create-disciplinary-action.usecase';
import { ListDisciplinaryActionsUseCase } from './use-cases/list-disciplinary-actions.usecase';
import { GetDisciplinaryActionUseCase } from './use-cases/get-disciplinary-action.usecase';
import { CreateGrievanceUseCase } from './use-cases/create-grievance.usecase';
import { ListGrievancesUseCase } from './use-cases/list-grievances.usecase';
import { GetGrievanceUseCase } from './use-cases/get-grievance.usecase';
import { UpdateGrievanceUseCase } from './use-cases/update-grievance.usecase';
import { CreateRecognitionUseCase } from './use-cases/create-recognition.usecase';
import { ListRecognitionsUseCase } from './use-cases/list-recognitions.usecase';
import { GetRecognitionUseCase } from './use-cases/get-recognition.usecase';
import { ApproveRecognitionUseCase } from './use-cases/approve-recognition.usecase';
import { CreateSurveyUseCase } from './use-cases/create-survey.usecase';
import { ListSurveysUseCase } from './use-cases/list-surveys.usecase';
import { GetSurveyUseCase } from './use-cases/get-survey.usecase';
import { UpdateSurveyUseCase } from './use-cases/update-survey.usecase';
import { SubmitSurveyResponseUseCase } from './use-cases/submit-survey-response.usecase';
import { GetSurveyResultsUseCase } from './use-cases/get-survey-results.usecase';
import { CreateMediationUseCase } from './use-cases/create-mediation.usecase';
import { ListMediationsUseCase } from './use-cases/list-mediations.usecase';
import { GetMediationUseCase } from './use-cases/get-mediation.usecase';
import { UpdateMediationUseCase } from './use-cases/update-mediation.usecase';

@ApiTags('HR Employee Relations')
@Controller('hr/relations')
@UseGuards(KeycloakAuthGuard, RbacGuard)
export class RelationsController {
  constructor(
    private readonly createIncidentReport: CreateIncidentReportUseCase,
    private readonly listIncidentReports: ListIncidentReportsUseCase,
    private readonly getIncidentReport: GetIncidentReportUseCase,
    private readonly updateIncidentReport: UpdateIncidentReportUseCase,
    private readonly createDisciplinaryAction: CreateDisciplinaryActionUseCase,
    private readonly listDisciplinaryActions: ListDisciplinaryActionsUseCase,
    private readonly getDisciplinaryAction: GetDisciplinaryActionUseCase,
    private readonly createGrievanceUseCase: CreateGrievanceUseCase,
    private readonly listGrievancesUseCase: ListGrievancesUseCase,
    private readonly getGrievanceUseCase: GetGrievanceUseCase,
    private readonly updateGrievanceUseCase: UpdateGrievanceUseCase,
    private readonly createRecognitionUseCase: CreateRecognitionUseCase,
    private readonly listRecognitionsUseCase: ListRecognitionsUseCase,
    private readonly getRecognitionUseCase: GetRecognitionUseCase,
    private readonly approveRecognitionUseCase: ApproveRecognitionUseCase,
    private readonly createSurveyUseCase: CreateSurveyUseCase,
    private readonly listSurveysUseCase: ListSurveysUseCase,
    private readonly getSurveyUseCase: GetSurveyUseCase,
    private readonly updateSurveyUseCase: UpdateSurveyUseCase,
    private readonly submitSurveyResponseUseCase: SubmitSurveyResponseUseCase,
    private readonly getSurveyResultsUseCase: GetSurveyResultsUseCase,
    private readonly createMediationUseCase: CreateMediationUseCase,
    private readonly listMediationsUseCase: ListMediationsUseCase,
    private readonly getMediationUseCase: GetMediationUseCase,
    private readonly updateMediationUseCase: UpdateMediationUseCase,
  ) {}

  @Post('incidents')
  @Roles(RelationsPermissions.CREATE)
  @ApiProtected({
    path: '/api/v1/hr/relations/incidents',
    roles: [RelationsPermissions.CREATE],
  })
  @ApiOperation({ summary: 'Report incident' })
  @ApiBody({ schema: { type: 'object' } })
  createIncident(@Body() body: CreateIncidentReportDto) {
    return this.createIncidentReport.execute(body);
  }

  @Get('incidents')
  @Roles(RelationsPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/relations/incidents',
    roles: [RelationsPermissions.VIEW],
  })
  @ApiOperation({ summary: 'List incident reports' })
  listIncidents(
    @Query('status') status?: string,
    @Query('severity') severity?: string,
  ) {
    return this.listIncidentReports.execute({ status, severity });
  }

  @Get('incidents/:id')
  @Roles(RelationsPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/relations/incidents/:id',
    roles: [RelationsPermissions.VIEW],
  })
  @ApiOperation({ summary: 'Get incident report' })
  @ApiParam({ name: 'id' })
  getIncident(@Param('id') id: string) {
    return this.getIncidentReport.execute(id);
  }

  @Patch('incidents/:id')
  @Roles(RelationsPermissions.UPDATE)
  @ApiProtected({
    path: '/api/v1/hr/relations/incidents/:id',
    roles: [RelationsPermissions.UPDATE],
  })
  @ApiOperation({ summary: 'Update incident report' })
  @ApiParam({ name: 'id' })
  @ApiBody({ schema: { type: 'object' } })
  updateIncident(
    @Param('id') id: string,
    @Body() body: UpdateIncidentReportDto,
  ) {
    return this.updateIncidentReport.execute(id, body);
  }

  @Post('disciplinary')
  @Roles(RelationsPermissions.CREATE)
  @ApiProtected({
    path: '/api/v1/hr/relations/disciplinary',
    roles: [RelationsPermissions.CREATE],
  })
  @ApiOperation({ summary: 'Create disciplinary action' })
  @ApiBody({ schema: { type: 'object' } })
  createDisciplinary(@Body() body: CreateDisciplinaryActionDto) {
    return this.createDisciplinaryAction.execute(body);
  }

  @Get('disciplinary')
  @Roles(RelationsPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/relations/disciplinary',
    roles: [RelationsPermissions.VIEW],
  })
  @ApiOperation({ summary: 'List disciplinary actions' })
  listDisciplinary(@Query('employeeId') employeeId?: string) {
    return this.listDisciplinaryActions.execute({ employeeId });
  }

  @Get('disciplinary/:id')
  @Roles(RelationsPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/relations/disciplinary/:id',
    roles: [RelationsPermissions.VIEW],
  })
  @ApiOperation({ summary: 'Get disciplinary action' })
  @ApiParam({ name: 'id' })
  getDisciplinary(@Param('id') id: string) {
    return this.getDisciplinaryAction.execute(id);
  }

  @Post('grievances')
  @Roles(RelationsPermissions.CREATE)
  @ApiProtected({
    path: '/api/v1/hr/relations/grievances',
    roles: [RelationsPermissions.CREATE],
  })
  @ApiOperation({ summary: 'Submit grievance' })
  @ApiBody({ schema: { type: 'object' } })
  createGrievance(@Body() body: CreateGrievanceDto) {
    return this.createGrievanceUseCase.execute(body);
  }

  @Get('grievances')
  @Roles(RelationsPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/relations/grievances',
    roles: [RelationsPermissions.VIEW],
  })
  @ApiOperation({ summary: 'List grievances' })
  listGrievances(
    @Query('employeeId') employeeId?: string,
    @Query('assignedToId') assignedToId?: string,
  ) {
    return this.listGrievancesUseCase.execute({ employeeId, assignedToId });
  }

  @Get('grievances/:id')
  @Roles(RelationsPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/relations/grievances/:id',
    roles: [RelationsPermissions.VIEW],
  })
  @ApiOperation({ summary: 'Get grievance' })
  @ApiParam({ name: 'id' })
  getGrievance(@Param('id') id: string) {
    return this.getGrievanceUseCase.execute(id);
  }

  @Patch('grievances/:id')
  @Roles(RelationsPermissions.UPDATE)
  @ApiProtected({
    path: '/api/v1/hr/relations/grievances/:id',
    roles: [RelationsPermissions.UPDATE],
  })
  @ApiOperation({ summary: 'Update grievance' })
  @ApiParam({ name: 'id' })
  @ApiBody({ schema: { type: 'object' } })
  updateGrievance(@Param('id') id: string, @Body() body: UpdateGrievanceDto) {
    return this.updateGrievanceUseCase.execute(id, body);
  }

  @Post('recognition')
  @Roles(RelationsPermissions.CREATE)
  @ApiProtected({
    path: '/api/v1/hr/relations/recognition',
    roles: [RelationsPermissions.CREATE],
  })
  @ApiOperation({ summary: 'Nominate for recognition' })
  @ApiBody({ schema: { type: 'object' } })
  createRecognition(@Body() body: CreateRecognitionDto) {
    return this.createRecognitionUseCase.execute(body);
  }

  @Get('recognition')
  @Roles(RelationsPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/relations/recognition',
    roles: [RelationsPermissions.VIEW],
  })
  @ApiOperation({ summary: 'List recognitions' })
  listRecognitions(
    @Query('nomineeEmployeeId') nomineeEmployeeId?: string,
    @Query('status') status?: string,
  ) {
    return this.listRecognitionsUseCase.execute({
      nomineeEmployeeId,
      status,
    });
  }

  @Get('recognition/:id')
  @Roles(RelationsPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/relations/recognition/:id',
    roles: [RelationsPermissions.VIEW],
  })
  @ApiOperation({ summary: 'Get recognition' })
  @ApiParam({ name: 'id' })
  getRecognition(@Param('id') id: string) {
    return this.getRecognitionUseCase.execute(id);
  }

  @Post('recognition/:id/approve')
  @Roles(RelationsPermissions.APPROVE)
  @ApiProtected({
    path: '/api/v1/hr/relations/recognition/:id/approve',
    roles: [RelationsPermissions.APPROVE],
  })
  @ApiOperation({ summary: 'Approve or reject recognition' })
  @ApiParam({ name: 'id' })
  @ApiBody({ schema: { type: 'object' } })
  approveRecognition(
    @Param('id') id: string,
    @Body() body: ApproveRecognitionDto,
    @Req() req: Request & { user?: AuthPrincipal },
  ) {
    const approverId =
      (req.user as AuthPrincipal)?.userId ??
      (req.user as AuthPrincipal)?.sub ??
      '';
    return this.approveRecognitionUseCase.execute(id, approverId, body);
  }

  @Post('surveys')
  @Roles(RelationsPermissions.CREATE)
  @ApiProtected({
    path: '/api/v1/hr/relations/surveys',
    roles: [RelationsPermissions.CREATE],
  })
  @ApiOperation({ summary: 'Create survey' })
  @ApiBody({ schema: { type: 'object' } })
  createSurvey(@Body() body: CreateSurveyDto) {
    return this.createSurveyUseCase.execute(body);
  }

  @Get('surveys')
  @Roles(RelationsPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/relations/surveys',
    roles: [RelationsPermissions.VIEW],
  })
  @ApiOperation({ summary: 'List surveys' })
  listSurveys(@Query('status') status?: string) {
    return this.listSurveysUseCase.execute({ status });
  }

  @Get('surveys/:id')
  @Roles(RelationsPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/relations/surveys/:id',
    roles: [RelationsPermissions.VIEW],
  })
  @ApiOperation({ summary: 'Get survey' })
  @ApiParam({ name: 'id' })
  getSurvey(@Param('id') id: string) {
    return this.getSurveyUseCase.execute(id);
  }

  @Patch('surveys/:id')
  @Roles(RelationsPermissions.UPDATE)
  @ApiProtected({
    path: '/api/v1/hr/relations/surveys/:id',
    roles: [RelationsPermissions.UPDATE],
  })
  @ApiOperation({ summary: 'Update survey (open/close)' })
  @ApiParam({ name: 'id' })
  @ApiBody({ schema: { type: 'object' } })
  updateSurvey(@Param('id') id: string, @Body() body: UpdateSurveyDto) {
    return this.updateSurveyUseCase.execute(id, body);
  }

  @Post('surveys/:id/responses')
  @Roles(RelationsPermissions.RESPOND)
  @ApiProtected({
    path: '/api/v1/hr/relations/surveys/:id/responses',
    roles: [RelationsPermissions.RESPOND],
  })
  @ApiOperation({ summary: 'Submit survey response' })
  @ApiParam({ name: 'id' })
  @ApiBody({ schema: { type: 'object' } })
  submitSurveyResponse(
    @Param('id') id: string,
    @Body() body: SubmitSurveyResponseDto,
  ) {
    return this.submitSurveyResponseUseCase.execute(id, body);
  }

  @Get('surveys/:id/results')
  @Roles(RelationsPermissions.RESULTS)
  @ApiProtected({
    path: '/api/v1/hr/relations/surveys/:id/results',
    roles: [RelationsPermissions.RESULTS],
  })
  @ApiOperation({ summary: 'Get survey aggregate results (closed only)' })
  @ApiParam({ name: 'id' })
  getSurveyResults(@Param('id') id: string) {
    return this.getSurveyResultsUseCase.execute(id);
  }

  @Post('mediation')
  @Roles(RelationsPermissions.CREATE)
  @ApiProtected({
    path: '/api/v1/hr/relations/mediation',
    roles: [RelationsPermissions.CREATE],
  })
  @ApiOperation({ summary: 'Request mediation' })
  @ApiBody({ schema: { type: 'object' } })
  createMediation(@Body() body: CreateConflictMediationDto) {
    return this.createMediationUseCase.execute(body);
  }

  @Get('mediation')
  @Roles(RelationsPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/relations/mediation',
    roles: [RelationsPermissions.VIEW],
  })
  @ApiOperation({ summary: 'List mediations' })
  listMediations(
    @Query('requesterEmployeeId') requesterEmployeeId?: string,
    @Query('mediatorId') mediatorId?: string,
    @Query('status') status?: string,
  ) {
    return this.listMediationsUseCase.execute({
      requesterEmployeeId,
      mediatorId,
      status,
    });
  }

  @Get('mediation/:id')
  @Roles(RelationsPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/relations/mediation/:id',
    roles: [RelationsPermissions.VIEW],
  })
  @ApiOperation({ summary: 'Get mediation' })
  @ApiParam({ name: 'id' })
  getMediation(@Param('id') id: string) {
    return this.getMediationUseCase.execute(id);
  }

  @Patch('mediation/:id')
  @Roles(RelationsPermissions.UPDATE)
  @ApiProtected({
    path: '/api/v1/hr/relations/mediation/:id',
    roles: [RelationsPermissions.UPDATE],
  })
  @ApiOperation({ summary: 'Update mediation' })
  @ApiParam({ name: 'id' })
  @ApiBody({ schema: { type: 'object' } })
  updateMediation(
    @Param('id') id: string,
    @Body() body: UpdateConflictMediationDto,
  ) {
    return this.updateMediationUseCase.execute(id, body);
  }
}
