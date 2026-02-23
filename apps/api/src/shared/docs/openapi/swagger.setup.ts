import type { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { OpenAPIObject } from '@nestjs/swagger';
import {
  SWAGGER_BEARER_AUTH_NAME,
  SWAGGER_DEFAULT_DOCS_PATH,
  SWAGGER_JSON_SPEC_PATH,
  SWAGGER_TAGS,
  SWAGGER_YAML_SPEC_PATH,
} from './openapi.constants';
import { SWAGGER_EXPORT_BUTTON_CSS } from './swagger-export-button';

function normalizePath(path: string): string {
  return path.replace(/^\/+/, '').replace(/\/+$/, '');
}

const DOC_TIMESTAMP = '2026-02-20T12:00:00.000Z';
const DOC_REQUEST_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
const DOC_VERSION = 'v1';
const DOC_SUCCESS_MESSAGE = 'Request processed successfully';

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object';
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

function successEnvelopeSchema(dataSchema: unknown): Record<string, unknown> {
  return {
    type: 'object',
    required: ['success', 'message', 'data', 'error', 'meta'],
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: DOC_SUCCESS_MESSAGE },
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

function successEnvelopeExample(data: unknown): Record<string, unknown> {
  return {
    success: true,
    message: DOC_SUCCESS_MESSAGE,
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
  for (const pathItem of Object.values(document.paths ?? {})) {
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
      if (!isRecord(operation) || !isRecord(operation.responses)) {
        continue;
      }

      for (const [statusCode, response] of Object.entries(
        operation.responses,
      )) {
        if (!isRecord(response)) {
          continue;
        }

        const content = response.content;
        if (!isRecord(content)) {
          continue;
        }

        const json = content['application/json'];
        if (!isRecord(json)) {
          continue;
        }

        const isSuccess = /^2\d{2}$/.test(statusCode);
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
            ? successEnvelopeSchema(json.schema)
            : errorEnvelopeSchema(json.schema);
        }

        if (dataExample !== undefined && !isEnvelopeExample(dataExample)) {
          json.example = isSuccess
            ? successEnvelopeExample(dataExample)
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
              ? successEnvelopeExample(example.value)
              : errorEnvelopeExample(example.value);
          }
        }
      }
    }
  }
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

\n\n${exportLinks}`,
    )
    .setVersion('1.0.0')
    .addServer(`/${apiPrefix}`, 'Versioned API base path')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Keycloak access token',
      },
      SWAGGER_BEARER_AUTH_NAME,
    );

  for (const tag of SWAGGER_TAGS) {
    documentBuilder = documentBuilder.addTag(tag.name, tag.description);
  }

  const document = SwaggerModule.createDocument(app, documentBuilder.build(), {
    deepScanRoutes: true,
    operationIdFactory: (controllerKey: string, methodKey: string) =>
      `${controllerKey.replace(/Controller$/, '')}_${methodKey}`.toLowerCase(),
  });

  enforceUnifiedSchemas(document);

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
