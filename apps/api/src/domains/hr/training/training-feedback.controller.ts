import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import type {
  CreateFeedbackTemplateDto,
  CreateTrainingFeedbackDto,
} from '@repo/types';
import { TrainingFeedbackPermissions } from '@repo/types/rbac';
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
import type { AuthPrincipal } from '../../../shared/interfaces/auth-principal.interface';
import { TrainingFeedbackService } from './training-feedback.service';

@ApiTags('HR Training Feedback')
@Controller('hr/training')
@UseGuards(KeycloakAuthGuard, RbacGuard)
export class TrainingFeedbackController {
  constructor(private readonly service: TrainingFeedbackService) {}

  @Get('feedback/templates')
  @Roles(TrainingFeedbackPermissions.VIEW, TrainingFeedbackPermissions.MANAGE)
  @ApiProtected({
    path: '/api/v1/hr/training/feedback/templates',
    roles: [
      TrainingFeedbackPermissions.VIEW,
      TrainingFeedbackPermissions.MANAGE,
    ],
  })
  @ApiOperation({ summary: 'List training feedback templates' })
  @ApiEnvelopeArrayResponse(
    GenericEntityResponseDto,
    'Training feedback templates',
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/training/feedback/templates',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  listTemplates(
    @Query('feedbackType') feedbackType?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.service.listTemplates({
      feedbackType,
      isActive:
        isActive == null
          ? undefined
          : ['true', '1'].includes(isActive.toLowerCase()),
    });
  }

  @Post('feedback/templates')
  @Roles(TrainingFeedbackPermissions.MANAGE)
  @ApiProtected({
    path: '/api/v1/hr/training/feedback/templates',
    roles: [TrainingFeedbackPermissions.MANAGE],
  })
  @ApiOperation({ summary: 'Create training feedback template' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiEnvelopeOkResponse(
    GenericEntityResponseDto,
    'Created training feedback template',
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/training/feedback/templates',
    badRequest: 'Training feedback template payload is invalid',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Authenticated user required to create template',
  })
  createTemplate(
    @Body() body: CreateFeedbackTemplateDto,
    @Req() req: Request & { user?: AuthPrincipal },
  ) {
    const createdById = req.user?.userId ?? req.user?.sub;
    if (!createdById) {
      throw new ForbiddenException(
        'Authenticated user required to create template',
      );
    }
    return this.service.createTemplate(body, createdById);
  }

  @Get('feedback')
  @Roles(TrainingFeedbackPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/training/feedback',
    roles: [TrainingFeedbackPermissions.VIEW],
  })
  @ApiOperation({ summary: 'List training feedback submissions' })
  @ApiEnvelopeArrayResponse(
    GenericEntityResponseDto,
    'Training feedback submissions',
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/training/feedback',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  listFeedback(
    @Query('trainingCompletionId') trainingCompletionId?: string,
    @Query('templateId') templateId?: string,
    @Query('participantId') participantId?: string,
    @Query('status') status?: string,
    @Query('submissionType') submissionType?: string,
    @Query('trainingRequestId') trainingRequestId?: string,
  ) {
    return this.service.listFeedback({
      trainingCompletionId,
      templateId,
      participantId,
      status,
      submissionType,
      trainingRequestId,
    });
  }

  @Post('feedback')
  @Roles(TrainingFeedbackPermissions.CREATE)
  @ApiProtected({
    path: '/api/v1/hr/training/feedback',
    roles: [TrainingFeedbackPermissions.CREATE],
  })
  @ApiOperation({ summary: 'Submit training feedback' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiEnvelopeOkResponse(
    GenericEntityResponseDto,
    'Submitted training feedback',
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/training/feedback',
    badRequest: 'Training feedback payload is invalid',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Authenticated user required to submit feedback',
  })
  createFeedback(
    @Body() body: CreateTrainingFeedbackDto,
    @Req() req: Request & { user?: AuthPrincipal },
  ) {
    const participantId = req.user?.userId ?? req.user?.sub;
    if (!participantId) {
      throw new ForbiddenException(
        'Authenticated user required to submit feedback',
      );
    }
    return this.service.createFeedback(body, participantId);
  }

  @Get('feedback/:id')
  @Roles(TrainingFeedbackPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/training/feedback/:id',
    roles: [TrainingFeedbackPermissions.VIEW],
  })
  @ApiOperation({ summary: 'Get training feedback' })
  @ApiParam({ name: 'id' })
  @ApiEnvelopeOkResponse(GenericEntityResponseDto, 'Training feedback')
  @ApiDefaultErrors({
    path: '/api/v1/hr/training/feedback/:id',
    notFound: 'Training feedback not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  getFeedback(@Param('id') id: string) {
    return this.service.getFeedback(id);
  }

  @Get('completions/:completionId/feedback')
  @Roles(TrainingFeedbackPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/training/completions/:completionId/feedback',
    roles: [TrainingFeedbackPermissions.VIEW],
  })
  @ApiOperation({ summary: 'List feedback for a training completion' })
  @ApiParam({ name: 'completionId' })
  @ApiEnvelopeArrayResponse(
    GenericEntityResponseDto,
    'Training completion feedback',
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/training/completions/:completionId/feedback',
    notFound: 'Training completion not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  listCompletionFeedback(@Param('completionId') completionId: string) {
    return this.service.listFeedback({ trainingCompletionId: completionId });
  }
}
