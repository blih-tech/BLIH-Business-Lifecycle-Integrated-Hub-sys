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
import {
  ContractResponseDto,
  CreateContractDto,
  UpdateContractDto,
} from './contracts.dto';

const metaExample = {
  timestamp: '2026-03-21T14:00:00.000Z',
  requestId: 'req_03HZ_CONTRACT_EXAMPLE',
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

const contractExample = {
  id: 'contract-uuid',
  templateId: 'template-uuid',
  templateTitle: 'Standard NDA',
  employeeContractId: 'emp-contract-uuid',
  signedFileUrl: null,
  signers: [
    {
      id: 'signer-uuid',
      userId: 'user-uuid',
      userName: 'John Doe',
      roleInContract: 'Employee',
      hasSigned: false,
    },
  ],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const resp = envelope('Contract retrieved', contractExample);
const createdResp = envelope('Contract created', contractExample);
const updatedResp = envelope('Contract updated', contractExample);
const listResp = envelope('Contracts retrieved', [contractExample]);
const paginatedResp = paginatedEnvelope('Contracts retrieved', [
  contractExample,
]);
const deleteResp = envelope('Contract deleted successfully', { success: true });
const signedResp = envelope('Contract signed', contractExample);

export function ApiContractsTag() {
  return applyDecorators(ApiTags('HR Contracts'));
}

export function ApiCreateContract() {
  return applyDecorators(
    ApiOperation({ summary: 'Create a contract' }),
    ApiBody({ type: CreateContractDto }),
    ApiProtected({ path: '/api/v1/hr/contracts', roles: [] }),
    ApiEnvelopeCreatedResponse(
      ContractResponseDto,
      'Created contract',
      createdResp,
    ),
    ApiDefaultErrors({
      path: '/api/v1/hr/contracts',
      badRequest: 'Invalid payload',
    }),
  );
}

export function ApiListAllContracts() {
  return applyDecorators(
    ApiOperation({ summary: 'List all contracts' }),
    ApiProtected({ path: '/api/v1/hr/contracts', roles: [] }),
    ApiEnvelopeArrayResponse(
      ContractResponseDto,
      'List of contracts',
      listResp,
    ),
    ApiDefaultErrors({ path: '/api/v1/hr/contracts' }),
  );
}

export function ApiListPaginatedContracts() {
  return applyDecorators(
    ApiOperation({ summary: 'List contracts (paginated)' }),
    ApiProtected({ path: '/api/v1/hr/contracts/paginated', roles: [] }),
    ApiEnvelopeArrayResponse(
      ContractResponseDto,
      'Paginated config list',
      paginatedResp,
    ),
    ApiDefaultErrors({ path: '/api/v1/hr/contracts/paginated' }),
  );
}

export function ApiGetContractById() {
  return applyDecorators(
    ApiOperation({ summary: 'Get contract by ID' }),
    ApiParam({ name: 'id' }),
    ApiProtected({ path: '/api/v1/hr/contracts/:id', roles: [] }),
    ApiEnvelopeOkResponse(ContractResponseDto, 'Contract details', resp),
    ApiDefaultErrors({
      path: '/api/v1/hr/contracts/:id',
      notFound: 'Not found',
    }),
  );
}

export function ApiUpdateContract() {
  return applyDecorators(
    ApiOperation({ summary: 'Update contract details' }),
    ApiParam({ name: 'id' }),
    ApiBody({ type: UpdateContractDto }),
    ApiProtected({ path: '/api/v1/hr/contracts/:id', roles: [] }),
    ApiEnvelopeOkResponse(ContractResponseDto, 'Updated contract', updatedResp),
    ApiDefaultErrors({
      path: '/api/v1/hr/contracts/:id',
      notFound: 'Not found',
    }),
  );
}

export function ApiDeleteContract() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete contract' }),
    ApiParam({ name: 'id' }),
    ApiProtected({ path: '/api/v1/hr/contracts/:id', roles: [] }),
    ApiEnvelopeOkResponse(
      ActionSuccessResponseDto,
      'Deleted contract',
      deleteResp,
    ),
    ApiDefaultErrors({
      path: '/api/v1/hr/contracts/:id',
      notFound: 'Not found',
    }),
  );
}

export function ApiSignContract() {
  return applyDecorators(
    ApiOperation({
      summary: 'Sign a contract (as the currently logged in user)',
    }),
    ApiParam({ name: 'id' }),
    ApiProtected({ path: '/api/v1/hr/contracts/:id/sign', roles: [] }),
    ApiEnvelopeOkResponse(ContractResponseDto, 'Signed contract', signedResp),
    ApiDefaultErrors({
      path: '/api/v1/hr/contracts/:id/sign',
      notFound: 'Not found',
    }),
  );
}
