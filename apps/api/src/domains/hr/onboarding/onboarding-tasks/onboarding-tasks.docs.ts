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
import { OnboardingTaskPermissions } from '@repo/types/rbac';
import {
  CreateOnboardingTaskDto,
  OnboardingTaskResponseDto,
  UpdateOnboardingTaskDto,
} from './onboarding-tasks.dto';
import { TaskType, TargetDataModel } from '@repo/database';

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
  title: 'Fill out HR Address Form',
  description: 'Provide permanent and current address.',
  taskType: TaskType.NON_CUSTOM,
  targetDataModel: TargetDataModel.EMPLOYEE_ADDRESS,
  requiresHrVerification: false,
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
      description:
        '`title` and `taskType` are required. `targetDataModel` is required if `taskType` is NON_CUSTOM.',
      examples: {
        create: {
          summary: 'Create data-model linked task',
          value: {
            title: 'Provide your Address Details',
            description: 'We need this to ensure accurate record keeping.',
            taskType: TaskType.NON_CUSTOM,
            targetDataModel: TargetDataModel.EMPLOYEE_ADDRESS,
            requiresHrVerification: true,
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
        'Returns the full (un-paginated) list.\n\nFilters: `taskType`, `targetDataModel`, `requiresHrVerification`, `search` (matches title/description).',
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
        'Paginated list wrapped in a success envelope with `meta.pagination`.\n\nFilters: `taskType`, `targetDataModel`, `requiresHrVerification`, `search`, `page`, `limit`.',
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
          summary: 'Update task execution requirement',
          value: {
            requiresHrVerification: true,
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
