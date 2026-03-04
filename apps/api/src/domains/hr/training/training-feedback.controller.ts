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
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import type {
  CreateFeedbackTemplateDto,
  CreateTrainingFeedbackDto,
} from '@repo/types';
import { TrainingFeedbackPermissions } from '../../../core/rbac/constants/permissions.constants';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { ApiProtected } from '../../../shared/docs/openapi';
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
  @ApiOkResponse({ description: 'Training feedback templates' })
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
  listCompletionFeedback(@Param('completionId') completionId: string) {
    return this.service.listFeedback({ trainingCompletionId: completionId });
  }
}
