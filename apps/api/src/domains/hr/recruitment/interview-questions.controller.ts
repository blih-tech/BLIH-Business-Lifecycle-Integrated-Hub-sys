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
import type { InterviewQuestionDto as InterviewQuestionContract } from '@repo/types';
import { InterviewPermissions } from '@repo/types/rbac';
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
  CreateInterviewQuestionDto,
  InterviewQuestionListQueryDto,
  InterviewQuestionResponseDto,
  UpdateInterviewQuestionDto,
} from './dto/interview-question.dto';
import {
  interviewQuestionListResponseEnvelope,
  interviewQuestionResponseEnvelope,
} from './recruitment.swagger-examples';
import {
  CreateInterviewQuestionUseCase,
  DeactivateInterviewQuestionUseCase,
  ListInterviewQuestionsUseCase,
  UpdateInterviewQuestionUseCase,
} from './use-cases/interview-questions.usecases';

@ApiTags('HR Recruitment Interview Questions')
@Controller('hr/recruitment/interview-questions')
@UseGuards(KeycloakAuthGuard, RbacGuard)
export class InterviewQuestionsController {
  constructor(
    private readonly createQuestion: CreateInterviewQuestionUseCase,
    private readonly updateQuestion: UpdateInterviewQuestionUseCase,
    private readonly deactivateQuestion: DeactivateInterviewQuestionUseCase,
    private readonly listQuestions: ListInterviewQuestionsUseCase,
  ) {}

  @Post()
  @Roles(InterviewPermissions.CREATE)
  @Audit('recruitment.interview_question.create', 'hr.interview_question')
  @ApiProtected({
    path: '/api/v1/hr/recruitment/interview-questions',
    roles: [InterviewPermissions.CREATE],
  })
  @ApiOperation({ summary: 'Create interview question bank entry' })
  @ApiBody({
    type: CreateInterviewQuestionDto,
    schema: {
      example: {
        question: 'Explain REST API principles',
        description:
          'Assess understanding of REST constraints and practical API design',
        category: 'TECHNICAL',
        type: 'TEXT',
        options: [],
        difficulty: 3,
        tags: ['rest', 'api', 'backend'],
      },
    },
  })
  @ApiEnvelopeOkResponse(
    InterviewQuestionResponseDto,
    'Created interview question',
    interviewQuestionResponseEnvelope,
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/recruitment/interview-questions',
    badRequest: 'Interview question payload is invalid',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  create(
    @Body() body: CreateInterviewQuestionDto,
    @Req() req: Request & { user?: AuthPrincipal },
  ): Promise<InterviewQuestionContract> {
    const user = req.user as AuthPrincipal | undefined;
    if (!user)
      throw new ForbiddenException('Authenticated user context is required');
    return this.createQuestion.execute(body, user.userId ?? user.sub);
  }

  @Patch(':id')
  @Roles(InterviewPermissions.UPDATE)
  @Audit('recruitment.interview_question.update', 'hr.interview_question')
  @ApiProtected({
    path: '/api/v1/hr/recruitment/interview-questions/:id',
    roles: [InterviewPermissions.UPDATE],
  })
  @ApiOperation({ summary: 'Update interview question bank entry' })
  @ApiParam({ name: 'id', description: 'Interview question id' })
  @ApiBody({
    type: UpdateInterviewQuestionDto,
    schema: {
      example: {
        question: 'Explain REST API principles with examples',
        difficulty: 4,
        tags: ['rest', 'api'],
      },
    },
  })
  @ApiEnvelopeOkResponse(
    InterviewQuestionResponseDto,
    'Updated interview question',
    interviewQuestionResponseEnvelope,
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/recruitment/interview-questions/:id',
    badRequest: 'Interview question payload is invalid',
    notFound: 'Interview question not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  update(
    @Param('id') id: string,
    @Body() body: UpdateInterviewQuestionDto,
  ): Promise<InterviewQuestionContract> {
    return this.updateQuestion.execute(id, body);
  }

  @Patch(':id/deactivate')
  @Roles(InterviewPermissions.UPDATE)
  @Audit('recruitment.interview_question.deactivate', 'hr.interview_question')
  @ApiProtected({
    path: '/api/v1/hr/recruitment/interview-questions/:id/deactivate',
    roles: [InterviewPermissions.UPDATE],
  })
  @ApiOperation({ summary: 'Deactivate interview question bank entry' })
  @ApiParam({ name: 'id', description: 'Interview question id' })
  @ApiEnvelopeOkResponse(
    InterviewQuestionResponseDto,
    'Deactivated interview question',
    interviewQuestionResponseEnvelope,
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/recruitment/interview-questions/:id/deactivate',
    notFound: 'Interview question not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  deactivate(@Param('id') id: string): Promise<InterviewQuestionContract> {
    return this.deactivateQuestion.execute(id);
  }

  @Get()
  @Roles(InterviewPermissions.VIEW)
  @Audit('recruitment.interview_question.list', 'hr.interview_question')
  @ApiProtected({
    path: '/api/v1/hr/recruitment/interview-questions',
    roles: [InterviewPermissions.VIEW],
  })
  @ApiOperation({ summary: 'List interview question bank entries' })
  @ApiEnvelopeArrayResponse(
    InterviewQuestionResponseDto,
    'List of interview questions',
    interviewQuestionListResponseEnvelope,
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/recruitment/interview-questions',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  list(
    @Query() query: InterviewQuestionListQueryDto,
  ): Promise<InterviewQuestionContract[]> {
    return this.listQuestions.execute(query);
  }
}
