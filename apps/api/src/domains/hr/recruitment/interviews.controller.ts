import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { InterviewPermissions } from '../../../core/rbac/constants/permissions.constants';
import { Audit } from '../../../shared/decorators/audit.decorator';
import { Roles } from '../../../shared/decorators/roles.decorator';
import {
  ApiDefaultErrors,
  ApiEnvelopeArrayResponse,
  ApiEnvelopeOkResponse,
  ApiProtected,
} from '../../../shared/docs/openapi';
import { KeycloakAuthGuard } from '../../../shared/guards/keycloak-auth.guard';
import { RbacGuard } from '../../../shared/guards/rbac.guard';
import type { AuthPrincipal } from '../../../shared/interfaces/auth-principal.interface';
import {
  CreateInterviewDto,
  InterviewFeedbackResponseDto,
  InterviewListQueryDto,
  InterviewResponseDto,
  UpdateInterviewDto,
  UpdateInterviewParticipantAttendanceDto,
  UpsertInterviewFeedbackDto,
} from './dto/interview.dto';
import {
  interviewFeedbackListResponseEnvelope,
  interviewFeedbackResponseEnvelope,
  interviewListResponseEnvelope,
  interviewResponseEnvelope,
} from './recruitment.swagger-examples';
import {
  CreateInterviewUseCase,
  GetInterviewUseCase,
  ListInterviewParticipantFeedbackUseCase,
  ListInterviewsUseCase,
  UpdateInterviewParticipantAttendanceUseCase,
  UpdateInterviewUseCase,
  UpsertInterviewFeedbackUseCase,
} from './use-cases/interviews.usecases';

@ApiTags('HR Recruitment Interviews')
@Controller('hr/recruitment/interviews')
@UseGuards(KeycloakAuthGuard, RbacGuard)
export class InterviewsController {
  constructor(
    private readonly createInterview: CreateInterviewUseCase,
    private readonly listInterviews: ListInterviewsUseCase,
    private readonly getInterviewById: GetInterviewUseCase,
    private readonly updateInterviewById: UpdateInterviewUseCase,
    private readonly updateParticipantAttendance: UpdateInterviewParticipantAttendanceUseCase,
    private readonly upsertFeedback: UpsertInterviewFeedbackUseCase,
    private readonly listFeedback: ListInterviewParticipantFeedbackUseCase,
  ) {}

  @Post()
  @Roles(InterviewPermissions.CREATE)
  @Audit('recruitment.interview.create', 'hr.interview')
  @ApiProtected({
    path: '/api/v1/hr/recruitment/interviews',
    roles: [InterviewPermissions.CREATE],
  })
  @ApiOperation({ summary: 'Create interview session' })
  @ApiBody({
    type: CreateInterviewDto,
    examples: {
      technicalRound: {
        summary: 'Schedule technical interview',
        value: {
          jobId: '0d9ff3b3-0a4a-42c5-a5b6-d4f809ec4374',
          type: 'TECHNICAL',
          round: 1,
          scheduledAt: '2026-03-25T09:00:00.000Z',
          durationMinutes: 60,
          location: 'Meeting Room A',
          applicantIds: ['8dea40a6-4ee2-4cca-9ff3-ac9e95e50384'],
          interviewers: [
            {
              interviewerId: 'e3f7b8a5-1b7f-447e-bf62-16e9a9b8d8e2',
              role: 'Panelist',
            },
          ],
        },
      },
    },
  })
  @ApiEnvelopeOkResponse(
    InterviewResponseDto,
    'Created interview session',
    interviewResponseEnvelope,
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/recruitment/interviews',
    badRequest: 'Interview payload is invalid',
    notFound: 'Referenced job, applicant, or interviewer not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  create(
    @Body() body: CreateInterviewDto,
    @Req() req: Request & { user?: AuthPrincipal },
  ) {
    const user = req.user as AuthPrincipal | undefined;
    if (!user)
      throw new ForbiddenException('Authenticated user context is required');
    return this.createInterview.execute(body, user.userId ?? user.sub);
  }

  @Get()
  @Roles(InterviewPermissions.VIEW)
  @Audit('recruitment.interview.list', 'hr.interview')
  @ApiProtected({
    path: '/api/v1/hr/recruitment/interviews',
    roles: [InterviewPermissions.VIEW],
  })
  @ApiOperation({ summary: 'List interview sessions' })
  @ApiEnvelopeArrayResponse(
    InterviewResponseDto,
    'List of interview sessions',
    interviewListResponseEnvelope,
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/recruitment/interviews',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  list(@Query() query: InterviewListQueryDto) {
    return this.listInterviews.execute(query);
  }

  @Get(':id')
  @Roles(InterviewPermissions.VIEW)
  @Audit('recruitment.interview.get', 'hr.interview')
  @ApiProtected({
    path: '/api/v1/hr/recruitment/interviews/:id',
    roles: [InterviewPermissions.VIEW],
  })
  @ApiOperation({ summary: 'Get interview session' })
  @ApiParam({ name: 'id', description: 'Interview session id' })
  @ApiEnvelopeOkResponse(
    InterviewResponseDto,
    'Interview session details',
    interviewResponseEnvelope,
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/recruitment/interviews/:id',
    notFound: 'Interview session not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  get(@Param('id') id: string) {
    return this.getInterviewById.execute(id);
  }

  @Patch(':id')
  @Roles(InterviewPermissions.UPDATE)
  @Audit('recruitment.interview.update', 'hr.interview')
  @ApiProtected({
    path: '/api/v1/hr/recruitment/interviews/:id',
    roles: [InterviewPermissions.UPDATE],
  })
  @ApiOperation({ summary: 'Update interview session' })
  @ApiParam({ name: 'id', description: 'Interview session id' })
  @ApiBody({
    type: UpdateInterviewDto,
    examples: {
      reschedule: {
        summary: 'Reschedule interview session',
        value: {
          scheduledAt: '2026-03-26T10:30:00.000Z',
          durationMinutes: 75,
          location: 'Meeting Room B',
        },
      },
    },
  })
  @ApiEnvelopeOkResponse(
    InterviewResponseDto,
    'Updated interview session',
    interviewResponseEnvelope,
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/recruitment/interviews/:id',
    badRequest: 'Interview payload is invalid',
    notFound: 'Interview session not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  update(@Param('id') id: string, @Body() body: UpdateInterviewDto) {
    return this.updateInterviewById.execute(id, body);
  }

  @Patch(':id/participants/:participantId/attendance')
  @Roles(InterviewPermissions.UPDATE)
  @Audit('recruitment.interview.attendance.update', 'hr.interview')
  @ApiProtected({
    path: '/api/v1/hr/recruitment/interviews/:id/participants/:participantId/attendance',
    roles: [InterviewPermissions.UPDATE],
  })
  @ApiOperation({ summary: 'Update interview participant attendance' })
  @ApiParam({ name: 'id', description: 'Interview session id' })
  @ApiParam({ name: 'participantId', description: 'Interview participant id' })
  @ApiBody({
    type: UpdateInterviewParticipantAttendanceDto,
    examples: {
      attended: {
        summary: 'Mark participant as attended',
        value: {
          attendanceStatus: 'COMPLETED',
        },
      },
    },
  })
  @ApiEnvelopeOkResponse(
    InterviewResponseDto,
    'Updated interview participant attendance',
    interviewResponseEnvelope,
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/recruitment/interviews/:id/participants/:participantId/attendance',
    badRequest: 'Attendance transition is invalid',
    notFound: 'Interview participant not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  updateAttendance(
    @Param('id') id: string,
    @Param('participantId') participantId: string,
    @Body() body: UpdateInterviewParticipantAttendanceDto,
  ) {
    return this.updateParticipantAttendance.execute(id, participantId, body);
  }

  @Post(':id/participants/:participantId/feedback')
  @Roles(InterviewPermissions.SUBMIT_FEEDBACK)
  @Audit('recruitment.interview.feedback.submit', 'hr.interview')
  @ApiProtected({
    path: '/api/v1/hr/recruitment/interviews/:id/participants/:participantId/feedback',
    roles: [InterviewPermissions.SUBMIT_FEEDBACK],
  })
  @ApiOperation({ summary: 'Submit or update interview feedback' })
  @ApiParam({ name: 'id', description: 'Interview session id' })
  @ApiParam({ name: 'participantId', description: 'Interview participant id' })
  @ApiBody({
    type: UpsertInterviewFeedbackDto,
    examples: {
      submitFeedback: {
        summary: 'Submit interviewer feedback',
        value: {
          score: 84,
          endorsement: 'YES',
          strengths: ['Strong problem-solving', 'Clear communication'],
          weaknesses: ['Needs deeper system design experience'],
          notes: 'Good candidate for next round.',
          isDraft: false,
        },
      },
    },
  })
  @ApiEnvelopeOkResponse(
    InterviewFeedbackResponseDto,
    'Upserted interview feedback',
    interviewFeedbackResponseEnvelope,
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/recruitment/interviews/:id/participants/:participantId/feedback',
    badRequest: 'Feedback payload is invalid',
    notFound: 'Interview participant not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing or interviewer is not assigned',
  })
  submitFeedback(
    @Param('id') id: string,
    @Param('participantId') participantId: string,
    @Body() body: UpsertInterviewFeedbackDto,
    @Req() req: Request & { user?: AuthPrincipal },
  ) {
    const user = req.user as AuthPrincipal | undefined;
    if (!user)
      throw new ForbiddenException('Authenticated user context is required');
    return this.upsertFeedback.execute(
      id,
      participantId,
      user.userId ?? user.sub,
      body,
    );
  }

  @Get(':id/participants/:participantId/feedback')
  @Roles(InterviewPermissions.VIEW)
  @Audit('recruitment.interview.feedback.list', 'hr.interview')
  @ApiProtected({
    path: '/api/v1/hr/recruitment/interviews/:id/participants/:participantId/feedback',
    roles: [InterviewPermissions.VIEW],
  })
  @ApiOperation({ summary: 'List interview participant feedback' })
  @ApiParam({ name: 'id', description: 'Interview session id' })
  @ApiParam({ name: 'participantId', description: 'Interview participant id' })
  @ApiEnvelopeArrayResponse(
    InterviewFeedbackResponseDto,
    'List interview participant feedback',
    interviewFeedbackListResponseEnvelope,
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/recruitment/interviews/:id/participants/:participantId/feedback',
    notFound: 'Interview participant not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  listParticipantFeedback(
    @Param('id') id: string,
    @Param('participantId') participantId: string,
  ) {
    return this.listFeedback.execute(id, participantId);
  }
}
