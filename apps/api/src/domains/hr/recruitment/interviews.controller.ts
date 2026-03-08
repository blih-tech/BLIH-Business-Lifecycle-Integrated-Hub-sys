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
import {
  CreateInterviewDto,
  InterviewListQueryDto,
  InterviewResponseDto,
  UpdateInterviewDto,
} from './dto/interview.dto';
import {
  interviewListResponseEnvelope,
  interviewResponseEnvelope,
} from './recruitment.swagger-examples';
import {
  CreateInterviewUseCase,
  GetInterviewUseCase,
  ListInterviewsUseCase,
  UpdateInterviewUseCase,
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
  ) {}

  @Post()
  @Roles(InterviewPermissions.CREATE)
  @Audit('recruitment.interview.create', 'hr.interview')
  @ApiProtected({
    path: '/api/v1/hr/recruitment/interviews',
    roles: [InterviewPermissions.CREATE],
  })
  @ApiOperation({ summary: 'Create interview' })
  @ApiBody({
    type: CreateInterviewDto,
    description:
      'Request body: applicationId (required, UUID), type (required), interviewerId (required UUID). Optional: round, status, scheduledAt, completedAt, interviewers, feedback, endorsement, score, nextAction.',
    examples: {
      createInterview: {
        summary: 'Schedule interview payload',
        value: {
          applicationId: '8dea40a6-4ee2-4cca-9ff3-ac9e95e50384',
          type: 'TECHNICAL',
          round: 1,
          status: 'SCHEDULED',
          scheduledAt: '2026-03-10T10:00:00.000Z',
          interviewerId: 'f8ef7938-8b1e-4a6e-bd25-c61432540273',
        },
      },
      createInterviewMinimal: {
        summary: 'Create interview (minimal)',
        value: {
          applicationId: '8dea40a6-4ee2-4cca-9ff3-ac9e95e50384',
          type: 'HR_SCREENING',
          interviewerId: 'f8ef7938-8b1e-4a6e-bd25-c61432540273',
        },
      },
    },
  })
  @ApiEnvelopeOkResponse(
    InterviewResponseDto,
    'Created interview',
    interviewResponseEnvelope,
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/recruitment/interviews',
    badRequest: 'Interview payload is invalid',
    notFound: 'Job application not found',
    conflict: 'Interview round already exists',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  create(@Body() body: CreateInterviewDto) {
    return this.createInterview.execute(body);
  }

  @Get()
  @Roles(InterviewPermissions.VIEW)
  @Audit('recruitment.interview.list', 'hr.interview')
  @ApiProtected({
    path: '/api/v1/hr/recruitment/interviews',
    roles: [InterviewPermissions.VIEW],
  })
  @ApiOperation({ summary: 'List interviews' })
  @ApiEnvelopeArrayResponse(
    InterviewResponseDto,
    'List of interviews',
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
  @ApiOperation({ summary: 'Get interview' })
  @ApiParam({ name: 'id', description: 'Interview id' })
  @ApiEnvelopeOkResponse(
    InterviewResponseDto,
    'Interview details',
    interviewResponseEnvelope,
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/recruitment/interviews/:id',
    notFound: 'Interview not found',
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
  @ApiOperation({ summary: 'Update interview' })
  @ApiParam({ name: 'id', description: 'Interview id' })
  @ApiBody({
    type: UpdateInterviewDto,
    description:
      'Request body: partial interview fields (all optional). Same structure as create; send only fields to update. Common: status, completedAt, feedback, endorsement (STRONG_YES|YES|UNCERTAIN|NO), score, nextAction.',
    examples: {
      updateInterview: {
        summary: 'Submit interview feedback',
        value: {
          status: 'COMPLETED',
          completedAt: '2026-03-10T11:00:00.000Z',
          feedback: 'Strong backend architecture knowledge.',
          endorsement: 'YES',
          score: 4.5,
          nextAction: 'Proceed to final round',
        },
      },
      updateInterviewReschedule: {
        summary: 'Reschedule interview',
        value: {
          scheduledAt: '2026-03-15T14:00:00.000Z',
          status: 'SCHEDULED',
        },
      },
    },
  })
  @ApiEnvelopeOkResponse(
    InterviewResponseDto,
    'Updated interview',
    interviewResponseEnvelope,
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/recruitment/interviews/:id',
    badRequest: 'Interview payload is invalid',
    notFound: 'Interview not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  update(@Param('id') id: string, @Body() body: UpdateInterviewDto) {
    return this.updateInterviewById.execute(id, body);
  }
}
