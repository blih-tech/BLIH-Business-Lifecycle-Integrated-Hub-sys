import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import {
  ApiDefaultErrors,
  ApiEnvelopeOkResponse,
  ApiProtected,
} from '../../../../shared/docs/openapi';
import { OnboardingPermissions } from '@repo/types/rbac';
import { OnboardingChecklistResponseDto } from '../onboarding.dto';
import { UpdateChecklistStatusDto } from './onboarding-checklist.dto';

export function ApiOnboardingChecklistTag() {
  return applyDecorators(ApiTags('HR Onboarding Checklist'));
}

export function ApiUpdateChecklistStatus() {
  return applyDecorators(
    ApiOperation({ summary: 'Update onboarding checklist item status' }),
    ApiParam({ name: 'id', description: 'OnboardingChecklist UUID' }),
    ApiBody({
      type: UpdateChecklistStatusDto,
      description: 'Update the status or due date of a checklist item.',
      examples: {
        update: {
          summary: 'Mark as in progress',
          value: { status: 'IN_PROGRESS' },
        },
      },
    }),
    ApiProtected({
      path: '/api/v1/hr/onboarding/checklists/:id/status',
      roles: [OnboardingPermissions.UPDATE],
    }),
    ApiEnvelopeOkResponse(
      OnboardingChecklistResponseDto,
      'Checklist status updated successfully',
      {
        success: true,
        message: 'Checklist status updated successfully',
        data: {
          id: 'checklist-uuid-1',
          onboardingTaskId: 'task-uuid-1',
          onboardingId: 'onboarding-uuid-1',
          status: 'IN_PROGRESS',
          dueDate: null,
          createdAt: '2026-03-11T08:00:00.000Z',
          updatedAt: '2026-03-11T14:00:00.000Z',
        },
        error: null,
        meta: {
          timestamp: '2026-03-11T14:00:00.000Z',
          requestId: 'req_01HZ_ONBOARDING_CHECKLIST_EXAMPLE',
          version: 'v1',
        },
      },
    ),
    ApiDefaultErrors({
      path: '/api/v1/hr/onboarding/checklists/:id/status',
      badRequest: 'Payload is invalid',
      notFound: 'Checklist item not found',
      unauthorized: 'Unauthorized: missing or invalid bearer access token',
      forbidden: 'Required roles are missing',
    }),
  );
}
