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
// Use string placeholders for permissions until the centralized types are updated
import {
  ContractTypeResponseDto,
  CreateContractTypeDto,
  UpdateContractTypeDto,
} from './contract-type.dto';

// ─── Swagger example data ─────────────────────────────────────────────────────

const metaExample = {
  timestamp: '2026-03-21T14:00:00.000Z',
  requestId: 'req_01HZ_CONTRACT_TYPE_EXAMPLE',
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
  ...envelope(message, data),
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

const typeExample = {
  id: 'type-uuid',
  name: 'Employment Contract',
  description: 'Standard full-time employment agreement',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const typeResponse = envelope(
  'Contract type retrieved successfully',
  typeExample,
);
const typeCreated = envelope('Contract type created successfully', typeExample);
const typeUpdated = envelope('Contract type updated successfully', typeExample);
const typeList = envelope('Contract types retrieved successfully', [
  typeExample,
]);
const typePaginatedList = paginatedEnvelope(
  'Contract types retrieved successfully',
  [typeExample],
);
const deleteResponse = envelope('Contract type deleted successfully', {
  success: true,
});

// ─── Controller-level class decorator ─────────────────────────────────────────

export function ApiContractTypeTag() {
  return applyDecorators(ApiTags('HR Contract Types'));
}

// ─── Endpoint decorators ──────────────────────────────────────────────────────

export function ApiCreateContractType() {
  return applyDecorators(
    ApiOperation({ summary: 'Create a contract type' }),
    ApiBody({ type: CreateContractTypeDto }),
    ApiProtected({
      path: '/api/v1/hr/contracts/types',
      // We will assume "contract.create" or similar exists, passing a string array for simplicity.
      // E.g., @Roles('contract.manage')
      roles: [],
    }),
    ApiEnvelopeCreatedResponse(
      ContractTypeResponseDto,
      'Created contract type',
      typeCreated,
    ),
    ApiDefaultErrors({
      path: '/api/v1/hr/contracts/types',
      badRequest: 'Payload is invalid',
      unauthorized: 'Unauthorized',
      forbidden: 'Required roles are missing',
    }),
  );
}

export function ApiListAllContractTypes() {
  return applyDecorators(
    ApiOperation({ summary: 'List all contract types' }),
    ApiProtected({ path: '/api/v1/hr/contracts/types', roles: [] }),
    ApiEnvelopeArrayResponse(
      ContractTypeResponseDto,
      'List of contract types',
      typeList,
    ),
    ApiDefaultErrors({ path: '/api/v1/hr/contracts/types' }),
  );
}

export function ApiListPaginatedContractTypes() {
  return applyDecorators(
    ApiOperation({ summary: 'List contract types (paginated)' }),
    ApiProtected({ path: '/api/v1/hr/contracts/types/paginated', roles: [] }),
    ApiEnvelopeArrayResponse(
      ContractTypeResponseDto,
      'Paginated list of contract types',
      typePaginatedList,
    ),
    ApiDefaultErrors({ path: '/api/v1/hr/contracts/types/paginated' }),
  );
}

export function ApiGetContractTypeById() {
  return applyDecorators(
    ApiOperation({ summary: 'Get contract type by ID' }),
    ApiParam({ name: 'id', description: 'Contract type UUID' }),
    ApiProtected({ path: '/api/v1/hr/contracts/types/:id', roles: [] }),
    ApiEnvelopeOkResponse(
      ContractTypeResponseDto,
      'Contract type details',
      typeResponse,
    ),
    ApiDefaultErrors({
      path: '/api/v1/hr/contracts/types/:id',
      notFound: 'Contract type not found',
    }),
  );
}

export function ApiUpdateContractType() {
  return applyDecorators(
    ApiOperation({ summary: 'Update contract type' }),
    ApiParam({ name: 'id', description: 'Contract type UUID' }),
    ApiBody({ type: UpdateContractTypeDto }),
    ApiProtected({ path: '/api/v1/hr/contracts/types/:id', roles: [] }),
    ApiEnvelopeOkResponse(
      ContractTypeResponseDto,
      'Updated contract type',
      typeUpdated,
    ),
    ApiDefaultErrors({
      path: '/api/v1/hr/contracts/types/:id',
      badRequest: 'Invalid payload',
      notFound: 'Contract type not found',
    }),
  );
}

export function ApiDeleteContractType() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete contract type' }),
    ApiParam({ name: 'id', description: 'Contract type UUID' }),
    ApiProtected({ path: '/api/v1/hr/contracts/types/:id', roles: [] }),
    ApiEnvelopeOkResponse(
      ActionSuccessResponseDto,
      'Deleted contract type',
      deleteResponse,
    ),
    ApiDefaultErrors({
      path: '/api/v1/hr/contracts/types/:id',
      notFound: 'Contract type not found',
    }),
  );
}
