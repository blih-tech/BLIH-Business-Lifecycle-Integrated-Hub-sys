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
import { ProbationPlanPermissions } from '@repo/types/rbac';
import {
  CreateProbationDto,
  ProbationResponseDto,
  UpdateProbationDto,
} from './probation.dto';

// ─── Swagger example data ─────────────────────────────────────────────────────

const metaExample = {
  timestamp: '2026-03-21T14:00:00.000Z',
  requestId: 'req_01HZ_PROBATION_EXAMPLE',
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

const probationExample = {
  id: 'probation-uuid-1',
  employeeId: 'employee-uuid',
  startDate: '2026-01-01',
  endDate: '2026-03-31',
  status: 'NOT_STARTED',
  kpis: [
    { id: 'probation-kpi-uuid-1', kpiId: 'kpi-uuid-1', kpiName: 'Q1 Sales Target', createdAt: '2026-01-01T00:00:00.000Z' },
  ],
  checkpoints: [
    { id: 'checkpoint-uuid-1', name: 'Month 1 Review', checkpointDate: '2026-02-01T00:00:00.000Z', createdAt: '2026-01-01T00:00:00.000Z' },
    { id: 'checkpoint-uuid-2', name: 'Final Review', checkpointDate: '2026-03-31T00:00:00.000Z', createdAt: '2026-01-01T00:00:00.000Z' },
  ],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const probationResponse = envelope('Probation plan retrieved successfully', probationExample);
const probationCreated = envelope('Probation plan created successfully', probationExample);
const probationUpdated = envelope('Probation plan updated successfully', probationExample);
const probationList = envelope('Probation plans retrieved successfully', [probationExample]);
const probationPaginatedList = paginatedEnvelope('Probation plans retrieved successfully', [probationExample]);
const deleteResponse = envelope('Probation plan deleted successfully', { success: true });

// ─── Controller-level class decorator ─────────────────────────────────────────

export function ApiProbationTag() {
  return applyDecorators(ApiTags('HR Probation Plans'));
}

// ─── Endpoint decorators ──────────────────────────────────────────────────────

export function ApiCreateProbation() {
  return applyDecorators(
    ApiOperation({ summary: 'Create a probation plan' }),
    ApiBody({
      type: CreateProbationDto,
      description: '`employeeId`, `startDate`, and `endDate` are required.',
      examples: {
        create: {
          summary: 'Create probation plan with KPIs and checkpoints',
          value: {
            employeeId: 'employee-uuid',
            startDate: '2026-01-01',
            endDate: '2026-03-31',
            status: 'NOT_STARTED',
            kpis: [
              { kpiId: 'kpi-uuid-1' },
              { kpiId: 'kpi-uuid-2' },
            ],
            checkpoints: [
              { name: 'Month 1 Review', checkpointDate: '2026-02-01' },
              { name: 'Month 2 Review', checkpointDate: '2026-03-01' },
              { name: 'Final Review', checkpointDate: '2026-03-31' },
            ],
          },
        },
      },
    }),
    ApiProtected({
      path: '/api/v1/hr/probation',
      roles: [ProbationPlanPermissions.CREATE],
    }),
    ApiEnvelopeCreatedResponse(
      ProbationResponseDto,
      'Created probation plan',
      probationCreated,
    ),
    ApiDefaultErrors({
      path: '/api/v1/hr/probation',
      badRequest: 'Probation plan payload is invalid',
      unauthorized: 'Unauthorized: missing or invalid bearer access token',
      forbidden: 'Required roles are missing',
    }),
  );
}

export function ApiListAllProbation() {
  return applyDecorators(
    ApiOperation({
      summary: 'List probation plans',
      description:
        'Returns the full (un-paginated) list.\n\nFilters: `employeeId`, `status`, `startDateFrom`, `startDateTo`.',
    }),
    ApiProtected({
      path: '/api/v1/hr/probation',
      roles: [ProbationPlanPermissions.VIEW],
    }),
    ApiEnvelopeArrayResponse(
      ProbationResponseDto,
      'List of probation plans',
      probationList,
    ),
    ApiDefaultErrors({
      path: '/api/v1/hr/probation',
      unauthorized: 'Unauthorized: missing or invalid bearer access token',
      forbidden: 'Required roles are missing',
    }),
  );
}

export function ApiListPaginatedProbation() {
  return applyDecorators(
    ApiOperation({
      summary: 'List probation plans (paginated)',
      description:
        'Paginated list wrapped in a success envelope with `meta.pagination`.\n\nFilters: `employeeId`, `status`, `startDateFrom`, `startDateTo`, `page`, `limit`.',
    }),
    ApiProtected({
      path: '/api/v1/hr/probation/paginated',
      roles: [ProbationPlanPermissions.VIEW],
    }),
    ApiEnvelopeArrayResponse(
      ProbationResponseDto,
      'Paginated list of probation plans',
      probationPaginatedList,
    ),
    ApiDefaultErrors({
      path: '/api/v1/hr/probation/paginated',
      unauthorized: 'Unauthorized: missing or invalid bearer access token',
      forbidden: 'Required roles are missing',
    }),
  );
}

export function ApiGetProbationById() {
  return applyDecorators(
    ApiOperation({ summary: 'Get probation plan by id' }),
    ApiParam({ name: 'id', description: 'Probation plan UUID' }),
    ApiProtected({
      path: '/api/v1/hr/probation/:id',
      roles: [ProbationPlanPermissions.VIEW],
    }),
    ApiEnvelopeOkResponse(
      ProbationResponseDto,
      'Probation plan details',
      probationResponse,
    ),
    ApiDefaultErrors({
      path: '/api/v1/hr/probation/:id',
      notFound: 'Probation plan not found',
      unauthorized: 'Unauthorized: missing or invalid bearer access token',
      forbidden: 'Required roles are missing',
    }),
  );
}

export function ApiUpdateProbation() {
  return applyDecorators(
    ApiOperation({ summary: 'Update probation plan' }),
    ApiParam({ name: 'id', description: 'Probation plan UUID' }),
    ApiBody({
      type: UpdateProbationDto,
      description:
        'All fields are optional — only provided fields are updated. Providing `kpis` or `checkpoints` will sync the full list.',
      examples: {
        update: {
          summary: 'Update status and sync checkpoints',
          value: {
            status: 'IN_PROGRESS',
            checkpoints: [
              { name: 'Month 1 Review', checkpointDate: '2026-02-01' },
              { name: 'Final Review (Extended)', checkpointDate: '2026-04-30' },
            ],
          },
        },
      },
    }),
    ApiProtected({
      path: '/api/v1/hr/probation/:id',
      roles: [ProbationPlanPermissions.UPDATE],
    }),
    ApiEnvelopeOkResponse(
      ProbationResponseDto,
      'Updated probation plan',
      probationUpdated,
    ),
    ApiDefaultErrors({
      path: '/api/v1/hr/probation/:id',
      badRequest: 'Probation plan payload is invalid',
      notFound: 'Probation plan not found',
      unauthorized: 'Unauthorized: missing or invalid bearer access token',
      forbidden: 'Required roles are missing',
    }),
  );
}

export function ApiDeleteProbation() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete probation plan' }),
    ApiParam({ name: 'id', description: 'Probation plan UUID' }),
    ApiProtected({
      path: '/api/v1/hr/probation/:id',
      roles: [ProbationPlanPermissions.ALL],
    }),
    ApiEnvelopeOkResponse(
      ActionSuccessResponseDto,
      'Deleted probation plan',
      deleteResponse,
    ),
    ApiDefaultErrors({
      path: '/api/v1/hr/probation/:id',
      notFound: 'Probation plan not found',
      unauthorized: 'Unauthorized: missing or invalid bearer access token',
      forbidden: 'Required roles are missing',
    }),
  );
}
