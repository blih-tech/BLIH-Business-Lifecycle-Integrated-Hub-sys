import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import {
  ApiDefaultErrors,
  ApiEnvelopeArrayResponse,
  ApiEnvelopeCreatedResponse,
  ApiEnvelopeOkResponse,
  ApiProtected,
} from '../../../../shared/docs/openapi';
import { AssetProvisioningPermissions } from '../../../../core/rbac/constants/permissions.constants';
import {
  AssetProvisioningResponseDto,
  CreateAssetProvisioningDto,
  UpdateAssetProvisioningDto,
} from './asset-provisioning.dto';

// ─── Swagger example data ─────────────────────────────────────────────────────

const metaExample = {
  timestamp: '2026-03-11T14:00:00.000Z',
  requestId: 'req_01HZ_ASSET_PROVISIONING_EXAMPLE',
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

const assetProvisioningExample = {
  id: 'asset-provisioning-uuid',
  employeeId: 'employee-uuid',
  equipment: [
    {
      item: 'Laptop',
      assetId: 'ASSET-001',
      serialNumber: 'SN-12345',
      status: 'ALLOCATED',
      allocatedAt: '2026-03-12T10:00:00.000Z',
      estimatedCost: 1200,
      currency: 'USD',
    },
  ],
  platformPermissions: {
    googleWorkspace: ['mail', 'drive'],
    slack: ['admin'],
  },
  itSupervisorApprovedAt: '2026-03-12T10:00:00.000Z',
  adminApprovedAt: null,
  financeApprovalRequired: false,
  status: 'PENDING',
  createdAt: '2026-03-11T14:00:00.000Z',
  updatedAt: '2026-03-11T14:00:00.000Z',
};

const assetResponse = envelope(
  'Asset provisioning retrieved successfully',
  assetProvisioningExample,
);
const assetCreated = envelope(
  'Asset provisioning created successfully',
  assetProvisioningExample,
);
const assetUpdated = envelope(
  'Asset provisioning updated successfully',
  assetProvisioningExample,
);
const assetList = envelope(
  'Asset provisioning records retrieved successfully',
  [assetProvisioningExample],
);
const assetPaginatedList = paginatedEnvelope(
  'Asset provisioning records retrieved successfully',
  [assetProvisioningExample],
);

// ─── Controller-level class decorator ─────────────────────────────────────────

export function ApiAssetProvisioningTag() {
  return applyDecorators(ApiTags('HR Asset Provisioning'));
}

// ─── Endpoint decorators ──────────────────────────────────────────────────────

export function ApiCreateAssetProvisioning() {
  return applyDecorators(
    ApiOperation({ summary: 'Create asset provisioning' }),
    ApiBody({
      type: CreateAssetProvisioningDto,
      description: '`employeeId` is required.',
      examples: {
        create: {
          summary: 'Create asset provisioning',
          value: {
            employeeId: 'employee-uuid',
            equipment: [
              {
                item: 'Laptop',
                assetId: 'ASSET-001',
                serialNumber: 'SN-12345',
              },
            ],
            platformPermissions: {
              googleWorkspace: ['mail', 'drive'],
              slack: ['admin'],
            },
            financeApprovalRequired: false,
          },
        },
      },
    }),
    ApiProtected({
      path: '/api/v1/hr/onboarding/asset-provisioning',
      roles: [AssetProvisioningPermissions.CREATE],
    }),
    ApiEnvelopeCreatedResponse(
      AssetProvisioningResponseDto,
      'Created asset provisioning',
      assetCreated,
    ),
    ApiDefaultErrors({
      path: '/api/v1/hr/onboarding/asset-provisioning',
      badRequest: 'Asset provisioning payload is invalid',
      unauthorized: 'Unauthorized: missing or invalid bearer access token',
      forbidden: 'Required roles are missing',
    }),
  );
}

export function ApiListAllAssetProvisioning() {
  return applyDecorators(
    ApiOperation({
      summary: 'List asset provisioning records',
      description:
        'Returns the full (un-paginated) list.\n\nFilters: `employeeId`, `status`, `financeApprovalRequired`.',
    }),
    ApiProtected({
      path: '/api/v1/hr/onboarding/asset-provisioning',
      roles: [AssetProvisioningPermissions.VIEW],
    }),
    ApiEnvelopeArrayResponse(
      AssetProvisioningResponseDto,
      'List of asset provisioning records',
      assetList,
    ),
    ApiDefaultErrors({
      path: '/api/v1/hr/onboarding/asset-provisioning',
      unauthorized: 'Unauthorized: missing or invalid bearer access token',
      forbidden: 'Required roles are missing',
    }),
  );
}

export function ApiListPaginatedAssetProvisioning() {
  return applyDecorators(
    ApiOperation({
      summary: 'List asset provisioning records (paginated)',
      description:
        'Paginated list wrapped in a success envelope with `meta.pagination`.\n\nFilters: `employeeId`, `status`, `financeApprovalRequired`, `page`, `limit`.',
    }),
    ApiProtected({
      path: '/api/v1/hr/onboarding/asset-provisioning/paginated',
      roles: [AssetProvisioningPermissions.VIEW],
    }),
    ApiEnvelopeArrayResponse(
      AssetProvisioningResponseDto,
      'Paginated list of asset provisioning records',
      assetPaginatedList,
    ),
    ApiDefaultErrors({
      path: '/api/v1/hr/onboarding/asset-provisioning/paginated',
      unauthorized: 'Unauthorized: missing or invalid bearer access token',
      forbidden: 'Required roles are missing',
    }),
  );
}

export function ApiGetAssetProvisioningById() {
  return applyDecorators(
    ApiOperation({ summary: 'Get asset provisioning by id' }),
    ApiParam({ name: 'id', description: 'Asset provisioning UUID' }),
    ApiProtected({
      path: '/api/v1/hr/onboarding/asset-provisioning/:id',
      roles: [AssetProvisioningPermissions.VIEW],
    }),
    ApiEnvelopeOkResponse(
      AssetProvisioningResponseDto,
      'Asset provisioning details',
      assetResponse,
    ),
    ApiDefaultErrors({
      path: '/api/v1/hr/onboarding/asset-provisioning/:id',
      notFound: 'Asset provisioning not found',
      unauthorized: 'Unauthorized: missing or invalid bearer access token',
      forbidden: 'Required roles are missing',
    }),
  );
}

export function ApiUpdateAssetProvisioning() {
  return applyDecorators(
    ApiOperation({ summary: 'Update asset provisioning' }),
    ApiParam({ name: 'id', description: 'Asset provisioning UUID' }),
    ApiBody({
      type: UpdateAssetProvisioningDto,
      description:
        'All fields are optional — only provided fields are updated.',
      examples: {
        update: {
          summary: 'Approve and update status',
          value: {
            status: 'APPROVED',
            itSupervisorApprovedAt: '2026-03-12T10:00:00.000Z',
          },
        },
      },
    }),
    ApiProtected({
      path: '/api/v1/hr/onboarding/asset-provisioning/:id',
      roles: [AssetProvisioningPermissions.UPDATE],
    }),
    ApiEnvelopeOkResponse(
      AssetProvisioningResponseDto,
      'Updated asset provisioning',
      assetUpdated,
    ),
    ApiDefaultErrors({
      path: '/api/v1/hr/onboarding/asset-provisioning/:id',
      badRequest: 'Asset provisioning payload is invalid',
      notFound: 'Asset provisioning not found',
      unauthorized: 'Unauthorized: missing or invalid bearer access token',
      forbidden: 'Required roles are missing',
    }),
  );
}
