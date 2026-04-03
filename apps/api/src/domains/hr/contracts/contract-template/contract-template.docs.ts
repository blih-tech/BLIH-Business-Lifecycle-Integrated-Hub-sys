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
import {
  ContractTemplateResponseDto,
  CreateContractTemplateDto,
  UpdateContractTemplateDto,
} from './contract-template.dto';

// ─── Swagger example data ─────────────────────────────────────────────────────

const metaExample = {
  timestamp: '2026-03-21T14:00:00.000Z',
  requestId: 'req_02HZ_TEMPLATE_EXAMPLE',
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

const templateExample = {
  id: 'template-uuid',
  title: 'Standard NDA',
  description: 'NDA for all employees',
  contractTypeId: 'type-uuid',
  type: {
    id: 'type-uuid',
    name: 'NDA Contract',
  },
  fileUrl: 'https://s3.bucket/nda-template.pdf',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const templateResponse = envelope(
  'Contract template retrieved successfully',
  templateExample,
);
const templateCreated = envelope(
  'Contract template created successfully',
  templateExample,
);
const templateUpdated = envelope(
  'Contract template updated successfully',
  templateExample,
);
const templateList = envelope('Contract templates retrieved successfully', [
  templateExample,
]);
const templatePaginatedList = paginatedEnvelope(
  'Contract templates retrieved successfully',
  [templateExample],
);
const deleteResponse = envelope('Contract template deleted successfully', {
  success: true,
});

// ─── Controller-level class decorator ─────────────────────────────────────────

export function ApiContractTemplateTag() {
  return applyDecorators(ApiTags('HR Contract Templates'));
}

// ─── Endpoint decorators ──────────────────────────────────────────────────────

export function ApiCreateContractTemplate() {
  return applyDecorators(
    ApiOperation({ summary: 'Create a contract template' }),
    ApiBody({ type: CreateContractTemplateDto }),
    ApiProtected({ path: '/api/v1/hr/contracts/templates', roles: [] }),
    ApiEnvelopeCreatedResponse(
      ContractTemplateResponseDto,
      'Created contract template',
      templateCreated,
    ),
    ApiDefaultErrors({
      path: '/api/v1/hr/contracts/templates',
      badRequest: 'Payload is invalid',
      unauthorized: 'Unauthorized',
      forbidden: 'Required roles are missing',
    }),
  );
}

export function ApiListAllContractTemplates() {
  return applyDecorators(
    ApiOperation({ summary: 'List all contract templates' }),
    ApiProtected({ path: '/api/v1/hr/contracts/templates', roles: [] }),
    ApiEnvelopeArrayResponse(
      ContractTemplateResponseDto,
      'List of contract templates',
      templateList,
    ),
    ApiDefaultErrors({ path: '/api/v1/hr/contracts/templates' }),
  );
}

export function ApiListPaginatedContractTemplates() {
  return applyDecorators(
    ApiOperation({ summary: 'List contract templates (paginated)' }),
    ApiProtected({
      path: '/api/v1/hr/contracts/templates/paginated',
      roles: [],
    }),
    ApiEnvelopeArrayResponse(
      ContractTemplateResponseDto,
      'Paginated list of contract templates',
      templatePaginatedList,
    ),
    ApiDefaultErrors({ path: '/api/v1/hr/contracts/templates/paginated' }),
  );
}

export function ApiGetContractTemplateById() {
  return applyDecorators(
    ApiOperation({ summary: 'Get contract template by ID' }),
    ApiParam({ name: 'id', description: 'Contract template UUID' }),
    ApiProtected({ path: '/api/v1/hr/contracts/templates/:id', roles: [] }),
    ApiEnvelopeOkResponse(
      ContractTemplateResponseDto,
      'Contract template details',
      templateResponse,
    ),
    ApiDefaultErrors({
      path: '/api/v1/hr/contracts/templates/:id',
      notFound: 'Contract template not found',
    }),
  );
}

export function ApiUpdateContractTemplate() {
  return applyDecorators(
    ApiOperation({ summary: 'Update contract template' }),
    ApiParam({ name: 'id', description: 'Contract template UUID' }),
    ApiBody({ type: UpdateContractTemplateDto }),
    ApiProtected({ path: '/api/v1/hr/contracts/templates/:id', roles: [] }),
    ApiEnvelopeOkResponse(
      ContractTemplateResponseDto,
      'Updated contract template',
      templateUpdated,
    ),
    ApiDefaultErrors({
      path: '/api/v1/hr/contracts/templates/:id',
      badRequest: 'Invalid payload',
      notFound: 'Contract template not found',
    }),
  );
}

export function ApiDeleteContractTemplate() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete contract template' }),
    ApiParam({ name: 'id', description: 'Contract template UUID' }),
    ApiProtected({ path: '/api/v1/hr/contracts/templates/:id', roles: [] }),
    ApiEnvelopeOkResponse(
      ActionSuccessResponseDto,
      'Deleted contract template',
      deleteResponse,
    ),
    ApiDefaultErrors({
      path: '/api/v1/hr/contracts/templates/:id',
      notFound: 'Contract template not found',
    }),
  );
}
