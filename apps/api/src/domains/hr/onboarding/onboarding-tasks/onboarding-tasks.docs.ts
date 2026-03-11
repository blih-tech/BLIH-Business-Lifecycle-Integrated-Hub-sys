import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import {
  ApiDefaultErrors,
  ApiEnvelopeArrayResponse,
  ApiEnvelopeCreatedResponse,
  ApiEnvelopeOkResponse,
  ApiProtected,
  ActionSuccessResponseDto,
} from '../../../../shared/docs/openapi';
import { OnboardingTaskPermissions } from '../../../../core/rbac/constants/permissions.constants';
import {
  CreateOnboardingTaskDto,
  OnboardingTaskResponseDto,
  UpdateOnboardingTaskDto,
} from './onboarding-tasks.dto';

// ─── Swagger example data ─────────────────────────────────────────────────────

const metaExample = {
  timestamp: '2026-03-11T14:00:00.000Z',
  requestId: 'req_01HZ_ONBOARDING_TASK_EXAMPLE',
  version: 'v1',
};

const envelope = <TData>(message: string, data: TData) => ({
  success: true,
  message,
  data,
  error: null,
  meta: metaExample,
});

const paginatedEnvelope = <TData>(message: string, data: TData) => ({
  success: true,
  message,
  data,
  error: null,
  meta: {
    ...metaExample,
    pagination: {
      page: 1,
      limit: 20,
      totalItems: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    },
  },
});

const onboardingTaskExample = {
  id: 'c9a7b3e1-12d4-4f18-b5a6-3f9d2c8e7b01',
  department: 'IT',
  title: 'Set up employee email account',
  description:
    'Create a corporate email and configure MFA for the new employee.',
  completedById: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  completedByName: 'Alice Njeri',
  checklistCount: 3,
  createdAt: '2026-03-11T14:00:00.000Z',
  updatedAt: '2026-03-11T14:00:00.000Z',
};

const taskResponse = envelope(
  'Onboarding task retrieved successfully',
  onboardingTaskExample,
);
const taskCreated = envelope(
  'Onboarding task created successfully',
  onboardingTaskExample,
);
const taskUpdated = envelope(
  'Onboarding task updated successfully',
  onboardingTaskExample,
);
const taskDeleted = envelope('Onboarding task deleted successfully', {
  success: true,
});
const taskList = envelope('Onboarding tasks retrieved successfully', [
  onboardingTaskExample,
]);
const taskPaginatedList = paginatedEnvelope(
  'Onboarding tasks retrieved successfully',
  [onboardingTaskExample],
);

// ─── Controller-level class decorator ─────────────────────────────────────────

export function ApiOnboardingTasksTag() {
  return applyDecorators(ApiTags('HR Onboarding Tasks'));
}

// ─── Endpoint decorators ──────────────────────────────────────────────────────

export function ApiCreateOnboardingTask() {
  return applyDecorators(
    ApiOperation({ summary: 'Create an onboarding task' }),
    ApiBody({
      type: CreateOnboardingTaskDto,
      description: '`department` and `title` are required.',
      examples: {
        create: {
          summary: 'Create IT onboarding task',
          value: {
            department: 'IT',
            title: 'Set up employee email account',
            description: 'Create a corporate email and configure MFA.',
            completedById: null,
          },
        },
      },
    }),
    ApiProtected({
      path: '/api/v1/hr/onboarding/tasks',
      roles: [OnboardingTaskPermissions.CREATE],
    }),
    ApiEnvelopeCreatedResponse(
      OnboardingTaskResponseDto,
      'Created onboarding task',
      taskCreated,
    ),
    ApiDefaultErrors({
      path: '/api/v1/hr/onboarding/tasks',
      badRequest: 'Onboarding task payload is invalid',
      unauthorized: 'Unauthorized: missing or invalid bearer access token',
      forbidden: 'Required roles are missing',
    }),
  );
}

export function ApiListAllOnboardingTasks() {
  return applyDecorators(
    ApiOperation({
      summary: 'List all onboarding tasks',
      description:
        'Returns the full (un-paginated) list.\n\nFilters: `department`, `search` (matches title/description), `completedById`.',
    }),
    ApiProtected({
      path: '/api/v1/hr/onboarding/tasks',
      roles: [OnboardingTaskPermissions.VIEW],
    }),
    ApiEnvelopeArrayResponse(
      OnboardingTaskResponseDto,
      'List of onboarding tasks',
      taskList,
    ),
    ApiDefaultErrors({
      path: '/api/v1/hr/onboarding/tasks',
      unauthorized: 'Unauthorized: missing or invalid bearer access token',
      forbidden: 'Required roles are missing',
    }),
  );
}

export function ApiListPaginatedOnboardingTasks() {
  return applyDecorators(
    ApiOperation({
      summary: 'List onboarding tasks (paginated)',
      description:
        'Paginated list wrapped in a success envelope with `meta.pagination`.\n\nFilters: `department`, `search`, `completedById`, `page`, `limit`.',
    }),
    ApiProtected({
      path: '/api/v1/hr/onboarding/tasks/paginated',
      roles: [OnboardingTaskPermissions.VIEW],
    }),
    ApiEnvelopeArrayResponse(
      OnboardingTaskResponseDto,
      'Paginated list of onboarding tasks',
      taskPaginatedList,
    ),
    ApiDefaultErrors({
      path: '/api/v1/hr/onboarding/tasks/paginated',
      unauthorized: 'Unauthorized: missing or invalid bearer access token',
      forbidden: 'Required roles are missing',
    }),
  );
}

export function ApiGetOnboardingTaskById() {
  return applyDecorators(
    ApiOperation({ summary: 'Get onboarding task by id' }),
    ApiParam({ name: 'id', description: 'Onboarding task UUID' }),
    ApiProtected({
      path: '/api/v1/hr/onboarding/tasks/:id',
      roles: [OnboardingTaskPermissions.VIEW],
    }),
    ApiEnvelopeOkResponse(
      OnboardingTaskResponseDto,
      'Onboarding task details',
      taskResponse,
    ),
    ApiDefaultErrors({
      path: '/api/v1/hr/onboarding/tasks/:id',
      notFound: 'Onboarding task not found',
      unauthorized: 'Unauthorized: missing or invalid bearer access token',
      forbidden: 'Required roles are missing',
    }),
  );
}

export function ApiUpdateOnboardingTask() {
  return applyDecorators(
    ApiOperation({ summary: 'Update onboarding task' }),
    ApiParam({ name: 'id', description: 'Onboarding task UUID' }),
    ApiBody({
      type: UpdateOnboardingTaskDto,
      description:
        'All fields are optional — only provided fields are updated.',
      examples: {
        update: {
          summary: 'Update title and mark completed',
          value: {
            title: 'Set up employee email & Slack',
            completedById: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          },
        },
      },
    }),
    ApiProtected({
      path: '/api/v1/hr/onboarding/tasks/:id',
      roles: [OnboardingTaskPermissions.UPDATE],
    }),
    ApiEnvelopeOkResponse(
      OnboardingTaskResponseDto,
      'Updated onboarding task',
      taskUpdated,
    ),
    ApiDefaultErrors({
      path: '/api/v1/hr/onboarding/tasks/:id',
      badRequest: 'Onboarding task payload is invalid',
      notFound: 'Onboarding task not found',
      unauthorized: 'Unauthorized: missing or invalid bearer access token',
      forbidden: 'Required roles are missing',
    }),
  );
}

export function ApiDeleteOnboardingTask() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete onboarding task' }),
    ApiParam({ name: 'id', description: 'Onboarding task UUID' }),
    ApiProtected({
      path: '/api/v1/hr/onboarding/tasks/:id',
      roles: [OnboardingTaskPermissions.DELETE],
    }),
    ApiEnvelopeOkResponse(
      ActionSuccessResponseDto,
      'Deleted onboarding task',
      taskDeleted,
    ),
    ApiDefaultErrors({
      path: '/api/v1/hr/onboarding/tasks/:id',
      notFound: 'Onboarding task not found',
      unauthorized: 'Unauthorized: missing or invalid bearer access token',
      forbidden: 'Required roles are missing',
    }),
  );
}
