import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import {
  ApiDefaultErrors,
  ApiEnvelopeArrayResponse,
  ApiEnvelopeCreatedResponse,
  ApiEnvelopeOkResponse,
  ApiProtected,
} from '../../../../shared/docs/openapi';
import { PolicyAcknowledgementPermissions } from '../../../../core/rbac/constants/permissions.constants';
import {
  CreatePolicyAcknowledgementDto,
  PolicyAcknowledgementResponseDto,
  UpdatePolicyAcknowledgementDto,
} from './policy-acknowledgement.dto';

// ─── Swagger example data ─────────────────────────────────────────────────────

const metaExample = {
  timestamp: '2026-03-11T14:00:00.000Z',
  requestId: 'req_01HZ_POLICY_ACK_EXAMPLE',
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

const policyAcknowledgementExample = {
  id: 'policy-ack-uuid',
  employeeId: 'employee-uuid',
  policies: [
    {
      policyId: 'POL-001',
      name: 'Code of Conduct',
      version: 'v2.0',
      acknowledgedAt: '2026-03-12T10:00:00.000Z',
      ipAddress: '192.168.1.10',
    },
  ],
  allAcknowledged: false,
  confirmedAt: '2026-03-12T10:00:00.000Z',
  systemAccessGrantedAt: null,
  verifiedById: null,
  verifiedAt: null,
  createdAt: '2026-03-11T14:00:00.000Z',
  updatedAt: '2026-03-11T14:00:00.000Z',
};

const policyResponse = envelope(
  'Policy acknowledgement retrieved successfully',
  policyAcknowledgementExample,
);
const policyCreated = envelope(
  'Policy acknowledgement created successfully',
  policyAcknowledgementExample,
);
const policyUpdated = envelope(
  'Policy acknowledgement updated successfully',
  policyAcknowledgementExample,
);
const policyList = envelope(
  'Policy acknowledgement records retrieved successfully',
  [policyAcknowledgementExample],
);
const policyPaginatedList = paginatedEnvelope(
  'Policy acknowledgement records retrieved successfully',
  [policyAcknowledgementExample],
);

// ─── Controller-level class decorator ─────────────────────────────────────────

export function ApiPolicyAcknowledgementTag() {
  return applyDecorators(ApiTags('HR Policy Acknowledgement'));
}

// ─── Endpoint decorators ──────────────────────────────────────────────────────

export function ApiCreatePolicyAcknowledgement() {
  return applyDecorators(
    ApiOperation({ summary: 'Create policy acknowledgement' }),
    ApiBody({
      type: CreatePolicyAcknowledgementDto,
      description: '`employeeId` is required.',
      examples: {
        create: {
          summary: 'Create policy acknowledgement',
          value: {
            employeeId: 'employee-uuid',
            policies: [
              {
                policyId: 'POL-001',
                name: 'Code of Conduct',
                version: 'v2.0',
                acknowledgedAt: '2026-03-12T10:00:00.000Z',
                ipAddress: '192.168.1.10',
              },
            ],
            allAcknowledged: false,
            confirmedAt: '2026-03-12T10:00:00.000Z',
          },
        },
      },
    }),
    ApiProtected({
      path: '/api/v1/hr/onboarding/policy-acknowledgement',
      roles: [PolicyAcknowledgementPermissions.CREATE],
    }),
    ApiEnvelopeCreatedResponse(
      PolicyAcknowledgementResponseDto,
      'Created policy acknowledgement',
      policyCreated,
    ),
    ApiDefaultErrors({
      path: '/api/v1/hr/onboarding/policy-acknowledgement',
      badRequest: 'Policy acknowledgement payload is invalid',
      unauthorized: 'Unauthorized: missing or invalid bearer access token',
      forbidden: 'Required roles are missing',
    }),
  );
}

export function ApiListAllPolicyAcknowledgement() {
  return applyDecorators(
    ApiOperation({
      summary: 'List policy acknowledgement records',
      description:
        'Returns the full (un-paginated) list.\n\nFilters: `employeeId`, `verifiedById`, `allAcknowledged`.',
    }),
    ApiProtected({
      path: '/api/v1/hr/onboarding/policy-acknowledgement',
      roles: [PolicyAcknowledgementPermissions.VIEW],
    }),
    ApiEnvelopeArrayResponse(
      PolicyAcknowledgementResponseDto,
      'List of policy acknowledgement records',
      policyList,
    ),
    ApiDefaultErrors({
      path: '/api/v1/hr/onboarding/policy-acknowledgement',
      unauthorized: 'Unauthorized: missing or invalid bearer access token',
      forbidden: 'Required roles are missing',
    }),
  );
}

export function ApiListPaginatedPolicyAcknowledgement() {
  return applyDecorators(
    ApiOperation({
      summary: 'List policy acknowledgement records (paginated)',
      description:
        'Paginated list wrapped in a success envelope with `meta.pagination`.\n\nFilters: `employeeId`, `verifiedById`, `allAcknowledged`, `page`, `limit`.',
    }),
    ApiProtected({
      path: '/api/v1/hr/onboarding/policy-acknowledgement/paginated',
      roles: [PolicyAcknowledgementPermissions.VIEW],
    }),
    ApiEnvelopeArrayResponse(
      PolicyAcknowledgementResponseDto,
      'Paginated list of policy acknowledgement records',
      policyPaginatedList,
    ),
    ApiDefaultErrors({
      path: '/api/v1/hr/onboarding/policy-acknowledgement/paginated',
      unauthorized: 'Unauthorized: missing or invalid bearer access token',
      forbidden: 'Required roles are missing',
    }),
  );
}

export function ApiGetPolicyAcknowledgementById() {
  return applyDecorators(
    ApiOperation({ summary: 'Get policy acknowledgement by id' }),
    ApiParam({ name: 'id', description: 'Policy acknowledgement UUID' }),
    ApiProtected({
      path: '/api/v1/hr/onboarding/policy-acknowledgement/:id',
      roles: [PolicyAcknowledgementPermissions.VIEW],
    }),
    ApiEnvelopeOkResponse(
      PolicyAcknowledgementResponseDto,
      'Policy acknowledgement details',
      policyResponse,
    ),
    ApiDefaultErrors({
      path: '/api/v1/hr/onboarding/policy-acknowledgement/:id',
      notFound: 'Policy acknowledgement not found',
      unauthorized: 'Unauthorized: missing or invalid bearer access token',
      forbidden: 'Required roles are missing',
    }),
  );
}

export function ApiUpdatePolicyAcknowledgement() {
  return applyDecorators(
    ApiOperation({ summary: 'Update policy acknowledgement' }),
    ApiParam({ name: 'id', description: 'Policy acknowledgement UUID' }),
    ApiBody({
      type: UpdatePolicyAcknowledgementDto,
      description:
        'All fields are optional — only provided fields are updated.',
      examples: {
        update: {
          summary: 'Verify policy acknowledgement',
          value: {
            verifiedById: 'user-uuid',
            verifiedAt: '2026-03-12T12:00:00.000Z',
            allAcknowledged: true,
          },
        },
      },
    }),
    ApiProtected({
      path: '/api/v1/hr/onboarding/policy-acknowledgement/:id',
      roles: [PolicyAcknowledgementPermissions.VERIFY],
    }),
    ApiEnvelopeOkResponse(
      PolicyAcknowledgementResponseDto,
      'Updated policy acknowledgement',
      policyUpdated,
    ),
    ApiDefaultErrors({
      path: '/api/v1/hr/onboarding/policy-acknowledgement/:id',
      badRequest: 'Policy acknowledgement payload is invalid',
      notFound: 'Policy acknowledgement not found',
      unauthorized: 'Unauthorized: missing or invalid bearer access token',
      forbidden: 'Required roles are missing',
    }),
  );
}
