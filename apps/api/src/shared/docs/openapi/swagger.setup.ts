import type { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { OpenAPIObject } from '@nestjs/swagger';
import { RESPONSE_MESSAGE_EXTENSION } from '../../decorators/response-message.decorator';
import {
  SWAGGER_BEARER_AUTH_NAME,
  SWAGGER_COOKIE_AUTH_NAME,
  SWAGGER_DEFAULT_DOCS_PATH,
  SWAGGER_JSON_SPEC_PATH,
  SWAGGER_TAGS,
  SWAGGER_YAML_SPEC_PATH,
} from './openapi.constants';
import { SWAGGER_EXPORT_BUTTON_CSS } from './swagger-export-button';

function normalizePath(path: string): string {
  return path.replace(/^\/+/, '').replace(/\/+$/, '');
}

function normalizeBaseUrl(url: string): string {
  const normalized = url.trim().replace(/\/+$/, '');
  return normalized || DEFAULT_KEYCLOAK_BASE_URL;
}

function hasPrefixedApiPaths(
  document: OpenAPIObject,
  apiPrefix: string,
): boolean {
  const normalizedPrefix = `/${normalizePath(apiPrefix)}`;
  return Object.keys(document.paths ?? {}).some(
    (path) =>
      path === normalizedPrefix || path.startsWith(`${normalizedPrefix}/`),
  );
}

export function resolveApiServerUrl(
  document: OpenAPIObject,
  apiPrefix: string,
): string {
  return hasPrefixedApiPaths(document, apiPrefix)
    ? '/'
    : `/${normalizePath(apiPrefix)}`;
}

const DOC_TIMESTAMP = '2026-02-20T12:00:00.000Z';
const DOC_REQUEST_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
const DOC_VERSION = 'v1';
const DOC_SUCCESS_MESSAGE = 'Request processed successfully';
const KEYCLOAK_LOGIN_PATH = '/realms/{realm}/protocol/openid-connect/token';
const DEFAULT_KEYCLOAK_BASE_URL = 'http://localhost:8080';
const DEFAULT_KEYCLOAK_REALM = 'blih';
const DEFAULT_KEYCLOAK_CLIENT_ID = 'blih-system-auth';

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object';
}

function isSuccessStatusCode(statusCode: string): boolean {
  return /^2\d{2}$/.test(statusCode);
}

function isRedirectStatusCode(statusCode: string): boolean {
  return /^3\d{2}$/.test(statusCode);
}

function methodNeedsSuccessResponse(method: string): boolean {
  return ['get', 'post', 'put', 'patch', 'delete'].includes(method);
}

function getOperationSummary(operation: Record<string, unknown>): string {
  return typeof operation.summary === 'string' ? operation.summary : '';
}

function hasPathParameter(operation: Record<string, unknown>): boolean {
  if (!Array.isArray(operation.parameters)) {
    return false;
  }

  return operation.parameters.some(
    (parameter) => isRecord(parameter) && parameter.in === 'path',
  );
}

function needsValidationResponse(
  method: string,
  operation: Record<string, unknown>,
): boolean {
  return (
    isRecord(operation.requestBody) ||
    hasPathParameter(operation) ||
    method === 'post' ||
    method === 'put' ||
    method === 'patch'
  );
}

function pickSuccessStatusCode(
  method: string,
  operation: Record<string, unknown>,
): string {
  const summary = getOperationSummary(operation).toLowerCase();
  if (method === 'post' && /^(create|record)\b/.test(summary)) {
    return '201';
  }

  return '200';
}

function deriveResourceName(path: string): string {
  const segment = path
    .split('/')
    .filter(Boolean)
    .reverse()
    .find((value) => !/^\{.+\}$/.test(value));

  if (!segment) {
    return 'resource';
  }

  const normalized = segment.replace(/-/g, ' ').replace(/s$/, '').trim();

  return normalized || 'resource';
}

function defaultResourceExample(path: string): Record<string, unknown> {
  const resource = deriveResourceName(path);

  return {
    id: '0d9ff3b3-0a4a-42c5-a5b6-d4f809ec4374',
    resource,
    status: 'ACTIVE',
    createdAt: DOC_TIMESTAMP,
    updatedAt: DOC_TIMESTAMP,
  };
}

function defaultSuccessDataExample(
  path: string,
  method: string,
  operation: Record<string, unknown>,
): unknown {
  const summary = getOperationSummary(operation).toLowerCase();

  if (summary.includes('health')) {
    return {
      status: 'degraded',
      checks: {
        database: { status: 'up' },
        keycloak: { status: 'down', error: 'connect ECONNREFUSED' },
        smtp: { status: 'up', mode: 'disabled' },
      },
      timestamp: DOC_TIMESTAMP,
    };
  }

  if (
    summary.includes('analytics') ||
    summary.includes('report') ||
    summary.includes('summary') ||
    summary.includes('trend') ||
    summary.includes('balance') ||
    summary.includes('progress')
  ) {
    return {
      rangeStart: '2026-02-01',
      rangeEnd: '2026-02-29',
      total: 1,
      items: [defaultResourceExample(path)],
    };
  }

  if (
    summary.includes('list') ||
    (method === 'get' && !hasPathParameter(operation))
  ) {
    return [defaultResourceExample(path)];
  }

  return defaultResourceExample(path);
}

function buildSchemaFromExample(example: unknown): Record<string, unknown> {
  if (Array.isArray(example)) {
    return {
      type: 'array',
      items:
        example.length > 0
          ? buildSchemaFromExample(example[0])
          : { type: 'object', additionalProperties: true },
    };
  }

  if (example === null) {
    return { type: 'object', nullable: true, example: null };
  }

  switch (typeof example) {
    case 'string':
      return { type: 'string', example };
    case 'number':
      return { type: 'number', example };
    case 'boolean':
      return { type: 'boolean', example };
    case 'object': {
      if (!isRecord(example)) {
        return { type: 'object', additionalProperties: true };
      }

      const properties: Record<string, unknown> = {};
      const required: string[] = [];

      for (const [key, value] of Object.entries(example)) {
        properties[key] = buildSchemaFromExample(value);
        if (value !== undefined) {
          required.push(key);
        }
      }

      return {
        type: 'object',
        ...(required.length > 0 && { required }),
        properties,
      };
    }
    default:
      return { type: 'object', additionalProperties: true };
  }
}

function ensureJsonMedia(
  response: Record<string, unknown>,
): Record<string, unknown> {
  if (!isRecord(response.content)) {
    response.content = {};
  }

  const content = response.content as Record<string, unknown>;
  if (!isRecord(content['application/json'])) {
    content['application/json'] = {};
  }

  return content['application/json'] as Record<string, unknown>;
}

function ensureSuccessResponse(
  method: string,
  path: string,
  operation: Record<string, unknown>,
): void {
  if (!isRecord(operation.responses)) {
    operation.responses = {};
  }

  const responses = operation.responses as Record<string, unknown>;
  const existingSuccess = Object.keys(responses).find(isSuccessStatusCode);
  const existingRedirect = Object.keys(responses).find(isRedirectStatusCode);
  if (existingSuccess) {
    const response = responses[existingSuccess];
    if (isRecord(response)) {
      ensureJsonMedia(response);
    }
    return;
  }

  if (existingRedirect) {
    return;
  }

  if (!methodNeedsSuccessResponse(method)) {
    return;
  }

  const statusCode = pickSuccessStatusCode(method, operation);
  const dataExample = defaultSuccessDataExample(path, method, operation);
  responses[statusCode] = {
    description:
      getOperationSummary(operation) || 'Request processed successfully',
    content: {
      'application/json': {
        schema: buildSchemaFromExample(dataExample),
        example: dataExample,
      },
    },
  };
}

function ensureDefaultErrorResponses(
  method: string,
  operation: Record<string, unknown>,
): void {
  if (!isRecord(operation.responses)) {
    operation.responses = {};
  }

  const responses = operation.responses as Record<string, unknown>;

  if (
    needsValidationResponse(method, operation) &&
    !isRecord(responses['400'])
  ) {
    responses['400'] = {
      description: 'Validation failed',
      content: { 'application/json': {} },
    };
  }

  if (
    hasPathParameter(operation) &&
    ['get', 'patch', 'delete', 'post'].includes(method) &&
    !isRecord(responses['404'])
  ) {
    responses['404'] = {
      description: 'Resource not found',
      content: { 'application/json': {} },
    };
  }
}

function isEnvelopeSchema(schema: unknown): boolean {
  if (!isRecord(schema)) {
    return false;
  }

  if (typeof schema.$ref === 'string') {
    return /Api(ErrorResponseDto|SuccessEnvelopeDto)|ResponseEnvelope/.test(
      schema.$ref,
    );
  }

  const props = schema.properties;
  if (!isRecord(props)) {
    return false;
  }

  return (
    'success' in props &&
    'message' in props &&
    'data' in props &&
    'error' in props &&
    'meta' in props
  );
}

function isEnvelopeExample(value: unknown): boolean {
  if (!isRecord(value)) {
    return false;
  }

  return (
    'success' in value &&
    'message' in value &&
    'data' in value &&
    'error' in value &&
    'meta' in value
  );
}

function mergeObjectExamples(
  examples: Array<Record<string, unknown>>,
): Record<string, unknown> | undefined {
  if (examples.length === 0) {
    return undefined;
  }
  return examples.reduce<Record<string, unknown>>(
    (acc, current) => ({ ...acc, ...current }),
    {},
  );
}

function resolveSchemaRef(
  ref: string,
  document: OpenAPIObject,
): Record<string, unknown> | undefined {
  const prefix = '#/components/schemas/';
  if (!ref.startsWith(prefix)) {
    return undefined;
  }
  const schemaName = ref.slice(prefix.length);
  const schemas = document.components?.schemas;
  const schema = schemas?.[schemaName];
  return isRecord(schema) ? schema : undefined;
}

function fallbackExampleForType(schema: Record<string, unknown>): unknown {
  if (Array.isArray(schema.enum) && schema.enum.length > 0) {
    return schema.enum[0];
  }

  switch (schema.type) {
    case 'string':
      return 'string';
    case 'integer':
    case 'number':
      return 0;
    case 'boolean':
      return true;
    case 'array':
      return [];
    case 'object':
      return {};
    default:
      return null;
  }
}

function buildDataExampleFromSchema(
  schema: unknown,
  document: OpenAPIObject,
  visitedRefs = new Set<string>(),
  depth = 0,
): unknown {
  if (!isRecord(schema) || depth > 8) {
    return undefined;
  }

  if ('example' in schema) {
    return schema.example;
  }

  if (typeof schema.$ref === 'string') {
    const ref = schema.$ref;
    if (visitedRefs.has(ref)) {
      return undefined;
    }
    visitedRefs.add(ref);
    const resolved = resolveSchemaRef(ref, document);
    if (!resolved) {
      return undefined;
    }
    return buildDataExampleFromSchema(
      resolved,
      document,
      visitedRefs,
      depth + 1,
    );
  }

  if (Array.isArray(schema.allOf)) {
    const objectExamples = schema.allOf
      .map((item) =>
        buildDataExampleFromSchema(
          item,
          document,
          new Set(visitedRefs),
          depth + 1,
        ),
      )
      .filter((value): value is Record<string, unknown> => isRecord(value));
    const merged = mergeObjectExamples(objectExamples);
    if (merged) {
      return merged;
    }
  }

  if (Array.isArray(schema.oneOf) && schema.oneOf.length > 0) {
    return buildDataExampleFromSchema(
      schema.oneOf[0],
      document,
      new Set(visitedRefs),
      depth + 1,
    );
  }

  if (Array.isArray(schema.anyOf) && schema.anyOf.length > 0) {
    return buildDataExampleFromSchema(
      schema.anyOf[0],
      document,
      new Set(visitedRefs),
      depth + 1,
    );
  }

  if (schema.type === 'array' || isRecord(schema.items)) {
    const itemSchema = isRecord(schema.items) ? schema.items : undefined;
    const itemExample = buildDataExampleFromSchema(
      itemSchema,
      document,
      new Set(visitedRefs),
      depth + 1,
    );
    return [itemExample ?? null];
  }

  if (isRecord(schema.properties)) {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(schema.properties)) {
      if (!isRecord(value)) {
        continue;
      }
      const propertyExample = buildDataExampleFromSchema(
        value,
        document,
        new Set(visitedRefs),
        depth + 1,
      );
      if (propertyExample !== undefined) {
        result[key] = propertyExample;
      }
    }
    if (Object.keys(result).length > 0) {
      return result;
    }
  }

  return fallbackExampleForType(schema);
}

function successEnvelopeSchema(
  dataSchema: unknown,
  message = DOC_SUCCESS_MESSAGE,
): Record<string, unknown> {
  return {
    type: 'object',
    required: ['success', 'message', 'data', 'error', 'meta'],
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: message },
      data: isRecord(dataSchema)
        ? dataSchema
        : { type: 'object', nullable: true },
      error: { type: 'null', nullable: true, example: null },
      meta: {
        type: 'object',
        required: ['timestamp', 'requestId', 'version'],
        properties: {
          timestamp: { type: 'string', format: 'date-time' },
          requestId: { type: 'string' },
          version: { type: 'string' },
          pagination: {
            type: 'object',
            required: [
              'page',
              'limit',
              'totalItems',
              'totalPages',
              'hasNextPage',
              'hasPreviousPage',
            ],
            properties: {
              page: { type: 'number' },
              limit: { type: 'number' },
              totalItems: { type: 'number' },
              totalPages: { type: 'number' },
              hasNextPage: { type: 'boolean' },
              hasPreviousPage: { type: 'boolean' },
            },
          },
        },
      },
    },
  };
}

function errorEnvelopeSchema(errorSchema: unknown): Record<string, unknown> {
  return {
    type: 'object',
    required: ['success', 'message', 'data', 'error', 'meta'],
    properties: {
      success: { type: 'boolean', example: false },
      message: { type: 'string', example: 'Request failed' },
      data: { type: 'null', nullable: true, example: null },
      error: isRecord(errorSchema)
        ? errorSchema
        : {
            type: 'object',
            properties: {
              code: { type: 'string' },
              details: { type: 'string' },
              fieldErrors: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    field: { type: 'string' },
                    message: { type: 'string' },
                  },
                },
              },
            },
          },
      meta: {
        type: 'object',
        required: ['timestamp', 'requestId', 'version'],
        properties: {
          timestamp: { type: 'string', format: 'date-time' },
          requestId: { type: 'string' },
          version: { type: 'string' },
        },
      },
    },
  };
}

function successEnvelopeExample(
  data: unknown,
  message = DOC_SUCCESS_MESSAGE,
): Record<string, unknown> {
  return {
    success: true,
    message,
    data: data ?? null,
    error: null,
    meta: {
      timestamp: DOC_TIMESTAMP,
      requestId: DOC_REQUEST_ID,
      version: DOC_VERSION,
    },
  };
}

function errorEnvelopeExample(body: unknown): Record<string, unknown> {
  let details = 'Request failed';
  if (isRecord(body) && typeof body.message === 'string') {
    details = body.message;
  } else if (typeof body === 'string') {
    details = body;
  }

  return {
    success: false,
    message: details,
    data: null,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      details,
    },
    meta: {
      timestamp: DOC_TIMESTAMP,
      requestId: DOC_REQUEST_ID,
      version: DOC_VERSION,
    },
  };
}

function defaultErrorEnvelopeExample(
  statusCode: string,
  description?: string,
): Record<string, unknown> {
  const details = description?.trim() || 'Request failed';
  const defaults: Record<string, { message: string; code: string }> = {
    '400': { message: 'Validation failed', code: 'VALIDATION_ERROR' },
    '401': { message: 'Unauthorized', code: 'UNAUTHORIZED' },
    '403': { message: 'Forbidden', code: 'FORBIDDEN' },
    '404': { message: 'Resource not found', code: 'NOT_FOUND' },
    '409': { message: 'Conflict', code: 'CONFLICT' },
  };

  const match = defaults[statusCode] ?? {
    message: 'Request failed',
    code: 'INTERNAL_SERVER_ERROR',
  };

  const base = errorEnvelopeExample({
    message: match.message,
    code: match.code,
    details,
  });

  base.message = match.message;
  base.error = {
    code: match.code,
    details,
  };

  if (statusCode === '400') {
    base.error = {
      code: match.code,
      details,
      fieldErrors: [
        { field: 'field', message: 'Validation constraint failed' },
      ],
    };
  }

  return base;
}

export function enforceUnifiedSchemas(document: OpenAPIObject): void {
  for (const [path, pathItem] of Object.entries(document.paths ?? {})) {
    if (!isRecord(pathItem)) {
      continue;
    }

    for (const method of [
      'get',
      'post',
      'put',
      'patch',
      'delete',
      'options',
      'head',
      'trace',
    ] as const) {
      const operation = pathItem[method];
      if (!isRecord(operation)) {
        continue;
      }

      ensureSuccessResponse(method, path, operation);
      ensureDefaultErrorResponses(method, operation);

      if (!isRecord(operation.responses)) {
        continue;
      }

      for (const [statusCode, response] of Object.entries(
        operation.responses,
      )) {
        if (isRedirectStatusCode(statusCode)) {
          continue;
        }

        if (!isRecord(response)) {
          continue;
        }

        const json = ensureJsonMedia(response);

        const isSuccess = isSuccessStatusCode(statusCode);
        const successMessage =
          isSuccess && typeof operation[RESPONSE_MESSAGE_EXTENSION] === 'string'
            ? operation[RESPONSE_MESSAGE_EXTENSION]
            : DOC_SUCCESS_MESSAGE;
        if (isSuccess && !isRecord(json.schema) && json.example === undefined) {
          const fallbackExample = defaultSuccessDataExample(
            path,
            method,
            operation,
          );
          json.schema = buildSchemaFromExample(fallbackExample);
          json.example = fallbackExample;
        } else if (
          isSuccess &&
          !isRecord(json.schema) &&
          json.example !== undefined
        ) {
          json.schema = buildSchemaFromExample(json.example);
        }
        const originalSchema = json.schema;
        const schemaLevelExample = isRecord(originalSchema)
          ? originalSchema.example
          : undefined;
        const dataExample =
          json.example ??
          schemaLevelExample ??
          buildDataExampleFromSchema(originalSchema, document);

        if (!isEnvelopeSchema(json.schema)) {
          json.schema = isSuccess
            ? successEnvelopeSchema(json.schema, successMessage)
            : errorEnvelopeSchema(json.schema);
        }

        if (dataExample !== undefined && !isEnvelopeExample(dataExample)) {
          json.example = isSuccess
            ? successEnvelopeExample(dataExample, successMessage)
            : errorEnvelopeExample(dataExample);
        } else if (!isSuccess && json.example === undefined) {
          json.example = defaultErrorEnvelopeExample(
            statusCode,
            typeof response.description === 'string'
              ? response.description
              : undefined,
          );
        }

        if (isRecord(json.examples)) {
          for (const example of Object.values(json.examples)) {
            if (!isRecord(example) || isEnvelopeExample(example.value)) {
              continue;
            }

            example.value = isSuccess
              ? successEnvelopeExample(example.value, successMessage)
              : errorEnvelopeExample(example.value);
          }
        }
      }
    }
  }
}

export function addKeycloakLoginOperation(
  document: OpenAPIObject,
  keycloakBaseUrl: string,
  defaultRealm: string,
  defaultClientId: string,
): void {
  if (!isRecord(document.paths)) {
    document.paths = {};
  }

  const paths = document.paths as Record<string, unknown>;
  const existingPath = paths[KEYCLOAK_LOGIN_PATH];
  const pathItem = isRecord(existingPath) ? existingPath : {};
  const normalizedKeycloakBaseUrl = normalizeBaseUrl(keycloakBaseUrl);

  pathItem.post = {
    tags: ['Auth'],
    summary: 'Keycloak login (token endpoint)',
    description:
      'Direct token issuance by Keycloak for password, client credentials, and refresh grants. This operation is external to the BLIH API service.',
    operationId: 'keycloak_login',
    servers: [
      {
        url: normalizedKeycloakBaseUrl,
        description: 'Keycloak base URL',
      },
    ],
    parameters: [
      {
        name: 'realm',
        in: 'path',
        required: true,
        description: 'Target Keycloak realm.',
        schema: {
          type: 'string',
          default: defaultRealm,
        },
      },
    ],
    requestBody: {
      required: true,
      content: {
        'application/x-www-form-urlencoded': {
          schema: {
            type: 'object',
            required: ['grant_type', 'client_id'],
            properties: {
              grant_type: {
                type: 'string',
                enum: [
                  'authorization_code',
                  'password',
                  'client_credentials',
                  'refresh_token',
                ],
                default: 'authorization_code',
              },
              client_id: {
                type: 'string',
                default: defaultClientId,
              },
              client_secret: {
                type: 'string',
              },
              username: {
                type: 'string',
                description: 'Required when grant_type=password.',
              },
              password: {
                type: 'string',
                format: 'password',
                description: 'Required when grant_type=password.',
              },
              scope: {
                type: 'string',
                example: 'openid profile email',
              },
              refresh_token: {
                type: 'string',
                description: 'Required when grant_type=refresh_token.',
              },
              code: {
                type: 'string',
                description: 'Required when grant_type=authorization_code.',
              },
              redirect_uri: {
                type: 'string',
                format: 'uri',
                description:
                  'Required when grant_type=authorization_code. Must match client redirect URI.',
              },
              code_verifier: {
                type: 'string',
                description:
                  'PKCE code verifier required when grant_type=authorization_code.',
              },
            },
          },
          examples: {
            authorizationCodeGrant: {
              summary: 'Authorization code flow with PKCE',
              value: {
                grant_type: 'authorization_code',
                client_id: defaultClientId,
                code: '3f95f8f9-1f31-40c1-9ed7-8eb7f0f3866f',
                redirect_uri: 'http://localhost:5000/api/v1/auth/callback',
                code_verifier: 'mX1j2N9Q8kP0pV2Yb9JQjTg7oQWJ5u0rZkQ1m3s9v7A',
              },
            },
            passwordGrant: {
              summary: 'User login with username/password',
              value: {
                grant_type: 'password',
                client_id: defaultClientId,
                username: 'admin',
                password: 'admin',
              },
            },
            clientCredentialsGrant: {
              summary: 'Service account login',
              value: {
                grant_type: 'client_credentials',
                client_id: defaultClientId,
                client_secret: 'your-client-secret',
              },
            },
            refreshTokenGrant: {
              summary: 'Refresh access token',
              value: {
                grant_type: 'refresh_token',
                client_id: defaultClientId,
                refresh_token: 'your-refresh-token',
              },
            },
          },
        },
      },
    },
    responses: {
      '200': {
        description: 'Token issued by Keycloak.',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['access_token', 'token_type', 'expires_in'],
              properties: {
                access_token: { type: 'string' },
                expires_in: { type: 'number' },
                refresh_expires_in: { type: 'number' },
                refresh_token: { type: 'string' },
                token_type: { type: 'string', example: 'Bearer' },
                id_token: { type: 'string' },
                'not-before-policy': { type: 'number' },
                session_state: { type: 'string' },
                scope: { type: 'string' },
              },
            },
            example: {
              access_token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
              expires_in: 300,
              refresh_expires_in: 1800,
              refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
              token_type: 'Bearer',
              id_token: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjQxNmQifQ...',
              'not-before-policy': 0,
              session_state: 'f0f4e9a0-2e06-4f66-94af-0d2d68ab4ac4',
              scope: 'openid profile email',
            },
          },
        },
      },
      '400': {
        description: 'Invalid grant or malformed request body.',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                error: { type: 'string' },
                error_description: { type: 'string' },
              },
            },
            example: {
              error: 'invalid_grant',
              error_description: 'Invalid user credentials',
            },
          },
        },
      },
      '401': {
        description: 'Client authentication failed.',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                error: { type: 'string' },
                error_description: { type: 'string' },
              },
            },
            example: {
              error: 'unauthorized_client',
              error_description:
                'Invalid client credentials or client is not allowed',
            },
          },
        },
      },
    },
  };

  paths[KEYCLOAK_LOGIN_PATH] = pathItem;
}

export function setupSwagger(app: INestApplication): void {
  const configService = app.get(ConfigService);
  const apiPrefix = normalizePath(
    configService.get<string>('API_PREFIX', 'api/v1'),
  );
  const docsPath = normalizePath(
    configService.get<string>('SWAGGER_PATH', SWAGGER_DEFAULT_DOCS_PATH),
  );

  const downloadBasePath = `/${apiPrefix}/${docsPath}/download`;
  const exportLinks = `**[Export OpenAPI spec (JSON)](${downloadBasePath}/openapi.json)** | **[YAML](${downloadBasePath}/openapi.yaml)**`;

  let documentBuilder = new DocumentBuilder()
    .setTitle('BLIH Core Platform API')
    .setDescription(
      `Enterprise API surface for authentication, authorization, governance, notifications, and audit.

**Response envelope:** All HTTP responses return a standard envelope: \`success\`, \`message\`, \`data\`, \`error\`, and \`meta\` (\`timestamp\`, \`requestId\`, \`version\`, with optional \`pagination\`).

**Browser auth cookies:** \`kc_access\` is the primary authentication artifact for browser requests. \`kc_refresh\` is used only for refresh rotation. \`kc_id\` is optional and never authorizes API requests.

\n\n${exportLinks}`,
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Keycloak access token',
      },
      SWAGGER_BEARER_AUTH_NAME,
    )
    .addCookieAuth(
      'kc_access',
      {
        type: 'apiKey',
        in: 'cookie',
        description:
          'Primary browser auth cookie. kc_refresh is refresh-only and kc_id is optional identity/logout support.',
      },
      SWAGGER_COOKIE_AUTH_NAME,
    );

  for (const tag of SWAGGER_TAGS) {
    documentBuilder = documentBuilder.addTag(tag.name, tag.description);
  }

  const document = SwaggerModule.createDocument(app, documentBuilder.build(), {
    deepScanRoutes: true,
    operationIdFactory: (controllerKey: string, methodKey: string) =>
      `${controllerKey.replace(/Controller$/, '')}_${methodKey}`.toLowerCase(),
  });

  document.servers = [
    {
      url: resolveApiServerUrl(document, apiPrefix),
      description: 'Application origin',
    },
  ];

  enforceUnifiedSchemas(document);
  addKeycloakLoginOperation(
    document,
    configService.get<string>('KEYCLOAK_URL', DEFAULT_KEYCLOAK_BASE_URL),
    configService.get<string>('KEYCLOAK_REALM', DEFAULT_KEYCLOAK_REALM),
    configService.get<string>(
      'KEYCLOAK_AUTH_CLIENT_ID',
      DEFAULT_KEYCLOAK_CLIENT_ID,
    ),
  );

  SwaggerModule.setup(docsPath, app, document, {
    useGlobalPrefix: true,
    customSiteTitle: 'BLIH Core Platform API Docs',
    customCss: SWAGGER_EXPORT_BUTTON_CSS,
    swaggerOptions: {
      persistAuthorization: true,
      filter: true,
      displayRequestDuration: true,
      docExpansion: 'none',
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    jsonDocumentUrl: `${docsPath}/${SWAGGER_JSON_SPEC_PATH}`,
    yamlDocumentUrl: `${docsPath}/${SWAGGER_YAML_SPEC_PATH}`,
  });
}
