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
import { ProbationKpiPermissions } from '@repo/types/rbac';
import {
  CreateKpiDto,
  KpiResponseDto,
  UpdateKpiDto,
} from './probation-kpi.dto';

// ─── Swagger example data ─────────────────────────────────────────────────────

const metaExample = {
  timestamp: '2026-03-21T14:00:00.000Z',
  requestId: 'req_01HZ_PROBATION_KPI_EXAMPLE',
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

const kpiExample = {
  id: 'c9a7b3e1-12d4-4f18-b5a6-3f9d2c8e7b01',
  name: 'Q1 Sales Target',
  description: 'Achieve $100k in sales by end of Q1.',
  createdAt: '2026-03-21T14:00:00.000Z',
  updatedAt: '2026-03-21T14:00:00.000Z',
};

const kpiResponse = envelope('KPI retrieved successfully', kpiExample);
const kpiCreated = envelope('KPI created successfully', kpiExample);
const kpiUpdated = envelope('KPI updated successfully', kpiExample);
const kpiDeleted = envelope('KPI deleted successfully', {
  success: true,
});
const kpiList = envelope('KPIs retrieved successfully', [kpiExample]);
const kpiPaginatedList = paginatedEnvelope('KPIs retrieved successfully', [
  kpiExample,
]);

// ─── Controller-level class decorator ─────────────────────────────────────────

export function ApiProbationKpisTag() {
  return applyDecorators(ApiTags('HR Probation KPIs'));
}

// ─── Endpoint decorators ──────────────────────────────────────────────────────

export function ApiCreateKpi() {
  return applyDecorators(
    ApiOperation({ summary: 'Create a KPI' }),
    ApiBody({
      type: CreateKpiDto,
      description: '`name` is required.',
      examples: {
        create: {
          summary: 'Create Sales KPI',
          value: {
            name: 'Q1 Sales Target',
            description: 'Achieve $100k in sales by end of Q1.',
          },
        },
      },
    }),
    ApiProtected({
      path: '/api/v1/hr/probation/kpis',
      roles: [ProbationKpiPermissions.CREATE],
    }),
    ApiEnvelopeCreatedResponse(KpiResponseDto, 'Created KPI', kpiCreated),
    ApiDefaultErrors({
      path: '/api/v1/hr/probation/kpis',
      badRequest: 'KPI payload is invalid',
      unauthorized: 'Unauthorized: missing or invalid bearer access token',
      forbidden: 'Required roles are missing',
    }),
  );
}

export function ApiListAllKpis() {
  return applyDecorators(
    ApiOperation({
      summary: 'List all KPIs',
      description:
        'Returns the full (un-paginated) list.\n\nFilters: `search` (matches name/description).',
    }),
    ApiProtected({
      path: '/api/v1/hr/probation/kpis',
      roles: [ProbationKpiPermissions.VIEW],
    }),
    ApiEnvelopeArrayResponse(KpiResponseDto, 'List of KPIs', kpiList),
    ApiDefaultErrors({
      path: '/api/v1/hr/probation/kpis',
      unauthorized: 'Unauthorized: missing or invalid bearer access token',
      forbidden: 'Required roles are missing',
    }),
  );
}

export function ApiListPaginatedKpis() {
  return applyDecorators(
    ApiOperation({
      summary: 'List KPIs (paginated)',
      description:
        'Paginated list wrapped in a success envelope with `meta.pagination`.\n\nFilters: `search`, `page`, `limit`.',
    }),
    ApiProtected({
      path: '/api/v1/hr/probation/kpis/paginated',
      roles: [ProbationKpiPermissions.VIEW],
    }),
    ApiEnvelopeArrayResponse(
      KpiResponseDto,
      'Paginated list of KPIs',
      kpiPaginatedList,
    ),
    ApiDefaultErrors({
      path: '/api/v1/hr/probation/kpis/paginated',
      unauthorized: 'Unauthorized: missing or invalid bearer access token',
      forbidden: 'Required roles are missing',
    }),
  );
}

export function ApiGetKpiById() {
  return applyDecorators(
    ApiOperation({ summary: 'Get KPI by id' }),
    ApiParam({ name: 'id', description: 'KPI UUID' }),
    ApiProtected({
      path: '/api/v1/hr/probation/kpis/:id',
      roles: [ProbationKpiPermissions.VIEW],
    }),
    ApiEnvelopeOkResponse(KpiResponseDto, 'KPI details', kpiResponse),
    ApiDefaultErrors({
      path: '/api/v1/hr/probation/kpis/:id',
      notFound: 'KPI not found',
      unauthorized: 'Unauthorized: missing or invalid bearer access token',
      forbidden: 'Required roles are missing',
    }),
  );
}

export function ApiUpdateKpi() {
  return applyDecorators(
    ApiOperation({ summary: 'Update KPI' }),
    ApiParam({ name: 'id', description: 'KPI UUID' }),
    ApiBody({
      type: UpdateKpiDto,
      description:
        'All fields are optional — only provided fields are updated.',
      examples: {
        update: {
          summary: 'Update descriptive text',
          value: {
            description: 'Updated description for the target.',
          },
        },
      },
    }),
    ApiProtected({
      path: '/api/v1/hr/probation/kpis/:id',
      roles: [ProbationKpiPermissions.UPDATE],
    }),
    ApiEnvelopeOkResponse(KpiResponseDto, 'Updated KPI', kpiUpdated),
    ApiDefaultErrors({
      path: '/api/v1/hr/probation/kpis/:id',
      badRequest: 'KPI payload is invalid',
      notFound: 'KPI not found',
      unauthorized: 'Unauthorized: missing or invalid bearer access token',
      forbidden: 'Required roles are missing',
    }),
  );
}

export function ApiDeleteKpi() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete KPI' }),
    ApiParam({ name: 'id', description: 'KPI UUID' }),
    ApiProtected({
      path: '/api/v1/hr/probation/kpis/:id',
      roles: [ProbationKpiPermissions.DELETE],
    }),
    ApiEnvelopeOkResponse(ActionSuccessResponseDto, 'Deleted KPI', kpiDeleted),
    ApiDefaultErrors({
      path: '/api/v1/hr/probation/kpis/:id',
      notFound: 'KPI not found',
      unauthorized: 'Unauthorized: missing or invalid bearer access token',
      forbidden: 'Required roles are missing',
    }),
  );
}
