import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import {
  ApiDefaultErrors,
  ApiEnvelopeArrayResponse,
  ApiEnvelopeCreatedResponse,
  ApiEnvelopeOkResponse,
  ApiProtected,
  ActionSuccessResponseDto,
} from '../../../shared/docs/openapi';
import { OnboardingPermissions } from '../../../core/rbac/constants/permissions.constants';
import {
  CreateOnboardingDto,
  OnboardingResponseDto,
  UpdateOnboardingDto,
} from './onboarding.dto';

// ─── Swagger example data ─────────────────────────────────────────────────────

const metaExample = {
  timestamp: '2026-03-11T14:00:00.000Z',
  requestId: 'req_01HZ_ONBOARDING_EXAMPLE',
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

const onboardingChecklistExample = {
  id: 'checklist-uuid-1',
  onboardingTaskId: 'task-uuid-1',
  onboardingId: 'onboarding-uuid-1',
  overseerId: 'user-uuid-1',
  status: 'NOT_STARTED',
  teamLeadVerifiedAt: null,
  ceoSignOffRequired: true,
  ceoSignOffAt: null,
  createdAt: '2026-03-11T14:00:00.000Z',
  updatedAt: '2026-03-11T14:00:00.000Z',
};

const onboardingExample = {
  id: 'onboarding-uuid-1',
  employeeId: 'employee-uuid',
  status: 'PENDING',
  startedAt: null,
  joinDate: '2026-03-10',
  completedAt: null,
  createdAt: '2026-03-11T14:00:00.000Z',
  updatedAt: '2026-03-11T14:00:00.000Z',
  checklists: [onboardingChecklistExample],
};

const onboardingResponse = envelope(
  'Onboarding retrieved successfully',
  onboardingExample,
);
const onboardingCreated = envelope(
  'Onboarding created successfully',
  onboardingExample,
);
const onboardingUpdated = envelope(
  'Onboarding updated successfully',
  onboardingExample,
);
const onboardingList = envelope('Onboarding records retrieved successfully', [
  onboardingExample,
]);
const onboardingPaginatedList = paginatedEnvelope(
  'Onboarding records retrieved successfully',
  [onboardingExample],
);
const deleteResponse = envelope('Onboarding deleted successfully', {
  success: true,
});

// ─── Controller-level class decorator ─────────────────────────────────────────

export function ApiOnboardingTag() {
  return applyDecorators(ApiTags('HR Onboarding'));
}

// ─── Endpoint decorators ──────────────────────────────────────────────────────

export function ApiCreateOnboarding() {
  return applyDecorators(
    ApiOperation({ summary: 'Create onboarding' }),
    ApiBody({
      type: CreateOnboardingDto,
      description: '`employeeId` and `joinDate` are required.',
      examples: {
        create: {
          summary: 'Create onboarding with checklists',
          value: {
            employeeId: 'employee-uuid',
            joinDate: '2026-03-10',
            checklists: [
              {
                onboardingTaskId: 'task-uuid-1',
                overseerId: 'user-uuid-1',
                ceoSignOffRequired: true,
              },
              {
                onboardingTaskId: 'task-uuid-2',
                overseerId: 'user-uuid-2',
              },
            ],
          },
        },
      },
    }),
    ApiProtected({
      path: '/api/v1/hr/onboarding',
      roles: [OnboardingPermissions.CREATE],
    }),
    ApiEnvelopeCreatedResponse(
      OnboardingResponseDto,
      'Created onboarding',
      onboardingCreated,
    ),
    ApiDefaultErrors({
      path: '/api/v1/hr/onboarding',
      badRequest: 'Onboarding payload is invalid',
      unauthorized: 'Unauthorized: missing or invalid bearer access token',
      forbidden: 'Required roles are missing',
    }),
  );
}

export function ApiListAllOnboarding() {
  return applyDecorators(
    ApiOperation({
      summary: 'List onboarding records',
      description:
        'Returns the full (un-paginated) list.\n\nFilters: `employeeId`, `status`, `joinDateFrom`, `joinDateTo`, `onboardingTaskId`, `overseerId`, `checklistStatus`.',
    }),
    ApiProtected({
      path: '/api/v1/hr/onboarding',
      roles: [OnboardingPermissions.VIEW],
    }),
    ApiEnvelopeArrayResponse(
      OnboardingResponseDto,
      'List of onboarding records',
      onboardingList,
    ),
    ApiDefaultErrors({
      path: '/api/v1/hr/onboarding',
      unauthorized: 'Unauthorized: missing or invalid bearer access token',
      forbidden: 'Required roles are missing',
    }),
  );
}

export function ApiListPaginatedOnboarding() {
  return applyDecorators(
    ApiOperation({
      summary: 'List onboarding records (paginated)',
      description:
        'Paginated list wrapped in a success envelope with `meta.pagination`.\n\nFilters: `employeeId`, `status`, `joinDateFrom`, `joinDateTo`, `onboardingTaskId`, `overseerId`, `checklistStatus`, `page`, `limit`.',
    }),
    ApiProtected({
      path: '/api/v1/hr/onboarding/paginated',
      roles: [OnboardingPermissions.VIEW],
    }),
    ApiEnvelopeArrayResponse(
      OnboardingResponseDto,
      'Paginated list of onboarding records',
      onboardingPaginatedList,
    ),
    ApiDefaultErrors({
      path: '/api/v1/hr/onboarding/paginated',
      unauthorized: 'Unauthorized: missing or invalid bearer access token',
      forbidden: 'Required roles are missing',
    }),
  );
}

export function ApiGetOnboardingById() {
  return applyDecorators(
    ApiOperation({ summary: 'Get onboarding by id' }),
    ApiParam({ name: 'id', description: 'Onboarding UUID' }),
    ApiProtected({
      path: '/api/v1/hr/onboarding/:id',
      roles: [OnboardingPermissions.VIEW],
    }),
    ApiEnvelopeOkResponse(
      OnboardingResponseDto,
      'Onboarding details',
      onboardingResponse,
    ),
    ApiDefaultErrors({
      path: '/api/v1/hr/onboarding/:id',
      notFound: 'Onboarding not found',
      unauthorized: 'Unauthorized: missing or invalid bearer access token',
      forbidden: 'Required roles are missing',
    }),
  );
}

export function ApiUpdateOnboarding() {
  return applyDecorators(
    ApiOperation({ summary: 'Update onboarding' }),
    ApiParam({ name: 'id', description: 'Onboarding UUID' }),
    ApiBody({
      type: UpdateOnboardingDto,
      description:
        'All fields are optional — only provided fields are updated.',
      examples: {
        update: {
          summary: 'Update onboarding status and checklist',
          value: {
            status: 'IN_PROGRESS',
            startedAt: '2026-03-11T09:00:00.000Z',
            checklists: [
              {
                onboardingTaskId: 'task-uuid-1',
                status: 'IN_PROGRESS',
                overseerId: 'user-uuid-1',
              },
            ],
          },
        },
      },
    }),
    ApiProtected({
      path: '/api/v1/hr/onboarding/:id',
      roles: [OnboardingPermissions.UPDATE],
    }),
    ApiEnvelopeOkResponse(
      OnboardingResponseDto,
      'Updated onboarding',
      onboardingUpdated,
    ),
    ApiDefaultErrors({
      path: '/api/v1/hr/onboarding/:id',
      badRequest: 'Onboarding payload is invalid',
      notFound: 'Onboarding not found',
      unauthorized: 'Unauthorized: missing or invalid bearer access token',
      forbidden: 'Required roles are missing',
    }),
  );
}

export function ApiDeleteOnboarding() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete onboarding' }),
    ApiParam({ name: 'id', description: 'Onboarding UUID' }),
    ApiProtected({
      path: '/api/v1/hr/onboarding/:id',
      roles: [OnboardingPermissions.DELETE],
    }),
    ApiEnvelopeOkResponse(
      ActionSuccessResponseDto,
      'Deleted onboarding',
      deleteResponse,
    ),
    ApiDefaultErrors({
      path: '/api/v1/hr/onboarding/:id',
      notFound: 'Onboarding not found',
      unauthorized: 'Unauthorized: missing or invalid bearer access token',
      forbidden: 'Required roles are missing',
    }),
  );
}
