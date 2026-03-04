import type { OpenAPIObject } from '@nestjs/swagger';
import { enforceUnifiedSchemas } from './swagger.setup';

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object';
}

function getJsonMedia(
  doc: OpenAPIObject,
  path: string,
  method: 'get' | 'post' | 'put' | 'patch' | 'delete',
  statusCode: string,
): Record<string, unknown> | undefined {
  const pathItem = doc.paths[path];
  if (!isRecord(pathItem)) {
    return undefined;
  }
  const operation = pathItem[method];
  if (!isRecord(operation)) {
    return undefined;
  }
  const responses = operation.responses;
  if (!isRecord(responses)) {
    return undefined;
  }
  const response = responses[statusCode];
  if (!isRecord(response)) {
    return undefined;
  }
  const content = response.content;
  if (!isRecord(content)) {
    return undefined;
  }
  const json = content['application/json'];
  return isRecord(json) ? json : undefined;
}

function hasEnvelopeProperties(schema: unknown): boolean {
  if (!schema || typeof schema !== 'object') {
    return false;
  }

  const props = (schema as { properties?: Record<string, unknown> }).properties;
  if (!props) {
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

function isEnvelopeExample(example: unknown): boolean {
  if (!example || typeof example !== 'object') {
    return false;
  }

  const value = example as Record<string, unknown>;
  return (
    'success' in value &&
    'message' in value &&
    'data' in value &&
    'error' in value &&
    'meta' in value
  );
}

describe('enforceUnifiedSchemas', () => {
  it('enforces unified envelope schema/examples for all JSON responses under /api/v1', () => {
    const doc: OpenAPIObject = {
      openapi: '3.0.0',
      info: { title: 'test', version: '1.0.0' },
      paths: {
        '/api/v1/test': {
          get: {
            responses: {
              '200': {
                description: 'ok',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: { id: { type: 'string' } },
                    },
                    example: { id: '1' },
                  },
                },
              },
              '400': {
                description: 'bad',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: { message: { type: 'string' } },
                    },
                    example: { message: 'Bad request' },
                  },
                },
              },
            },
          },
        },
      },
      components: {},
      tags: [],
    };

    enforceUnifiedSchemas(doc);

    for (const [path, pathItem] of Object.entries(doc.paths)) {
      if (!path.startsWith('/api/v1')) {
        continue;
      }
      for (const operation of Object.values(pathItem)) {
        if (!operation || typeof operation !== 'object') {
          continue;
        }
        const responses = (operation as { responses?: Record<string, unknown> })
          .responses;
        if (!responses) {
          continue;
        }
        for (const response of Object.values(responses)) {
          const content = (response as { content?: Record<string, unknown> })
            .content;
          const json = content?.['application/json'] as
            | { schema?: unknown; example?: unknown }
            | undefined;
          if (!json) {
            continue;
          }

          expect(hasEnvelopeProperties(json.schema)).toBe(true);
          if (json.example !== undefined) {
            expect(isEnvelopeExample(json.example)).toBe(true);
          }
        }
      }
    }
  });

  it('wraps schema-level examples into the unified success envelope', () => {
    const doc: OpenAPIObject = {
      openapi: '3.0.0',
      info: { title: 'test', version: '1.0.0' },
      paths: {
        '/api/v1/users': {
          post: {
            responses: {
              '201': {
                description: 'created',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        email: { type: 'string' },
                      },
                      example: {
                        id: '0d9ff3b3-0a4a-42c5-a5b6-d4f809ec4374',
                        email: 'jane.doe@blih.local',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      components: {},
      tags: [],
    };

    enforceUnifiedSchemas(doc);

    const json = getJsonMedia(doc, '/api/v1/users', 'post', '201') as
      | {
          schema?: unknown;
          example?: unknown;
        }
      | undefined;

    expect(json).toBeDefined();
    expect(hasEnvelopeProperties(json?.schema)).toBe(true);
    expect(isEnvelopeExample(json?.example)).toBe(true);
    expect((json?.example as { data?: unknown })?.data).toEqual({
      id: '0d9ff3b3-0a4a-42c5-a5b6-d4f809ec4374',
      email: 'jane.doe@blih.local',
    });
  });

  it('builds success data example from referenced component schema examples', () => {
    const doc: OpenAPIObject = {
      openapi: '3.0.0',
      info: { title: 'test', version: '1.0.0' },
      paths: {
        '/api/v1/users': {
          get: {
            responses: {
              '200': {
                description: 'ok',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/UserResponseDto',
                    },
                  },
                },
              },
            },
          },
        },
      },
      components: {
        schemas: {
          UserResponseDto: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                example: '0d9ff3b3-0a4a-42c5-a5b6-d4f809ec4374',
              },
              email: { type: 'string', example: 'jane.doe@blih.local' },
              firstName: { type: 'string', example: 'Jane' },
              lastName: { type: 'string', example: 'Doe' },
            },
          },
        },
      },
      tags: [],
    };

    enforceUnifiedSchemas(doc);

    const json = getJsonMedia(doc, '/api/v1/users', 'get', '200') as
      | { example?: unknown }
      | undefined;
    const example = json?.example as { data?: unknown } | undefined;

    expect(isEnvelopeExample(json?.example)).toBe(true);
    expect(example?.data).toEqual({
      id: '0d9ff3b3-0a4a-42c5-a5b6-d4f809ec4374',
      email: 'jane.doe@blih.local',
      firstName: 'Jane',
      lastName: 'Doe',
    });
  });

  it('wraps application/json examples map entries into envelope examples', () => {
    const doc: OpenAPIObject = {
      openapi: '3.0.0',
      info: { title: 'test', version: '1.0.0' },
      paths: {
        '/api/v1/users': {
          get: {
            responses: {
              '200': {
                description: 'ok',
                content: {
                  'application/json': {
                    schema: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                        },
                      },
                    },
                    examples: {
                      usersList: {
                        value: [{ id: 'user-1' }],
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      components: {},
      tags: [],
    };

    enforceUnifiedSchemas(doc);

    const json = getJsonMedia(doc, '/api/v1/users', 'get', '200') as
      | {
          examples?: Record<string, { value?: unknown }>;
        }
      | undefined;

    const usersList = json?.examples?.usersList?.value as
      | { data?: unknown }
      | undefined;
    expect(isEnvelopeExample(usersList)).toBe(true);
    expect(usersList?.data).toEqual([{ id: 'user-1' }]);
  });

  it('uses route-specific response messages when the operation declares one', () => {
    const doc = {
      openapi: '3.0.0',
      info: { title: 'test', version: '1.0.0' },
      paths: {
        '/api/v1/users': {
          post: {
            'x-response-message': 'User created successfully',
            responses: {
              '201': {
                description: 'created',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: { id: { type: 'string' } },
                      example: { id: 'user-1' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      components: {},
      tags: [],
    } as OpenAPIObject;

    enforceUnifiedSchemas(doc);

    const json = getJsonMedia(doc, '/api/v1/users', 'post', '201') as
      | { example?: { message?: string }; schema?: Record<string, unknown> }
      | undefined;
    const schema = json?.schema as
      | { properties?: { message?: { example?: string } } }
      | undefined;

    expect(json?.example?.message).toBe('User created successfully');
    expect(schema?.properties?.message?.example).toBe(
      'User created successfully',
    );
  });

  it('adds status-specific error examples when only ApiErrorResponseDto ref is present', () => {
    const doc: OpenAPIObject = {
      openapi: '3.0.0',
      info: { title: 'test', version: '1.0.0' },
      paths: {
        '/api/v1/realms': {
          post: {
            responses: {
              '401': {
                description: 'Authentication failure.',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/ApiErrorResponseDto',
                    },
                  },
                },
              },
              '403': {
                description: 'Authorization failure.',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/ApiErrorResponseDto',
                    },
                  },
                },
              },
            },
          },
        },
      },
      components: {
        schemas: {
          ApiErrorResponseDto: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: false },
              message: { type: 'string', example: 'Validation failed' },
              data: { type: 'null', nullable: true, example: null },
              error: {
                type: 'object',
                properties: {
                  code: { type: 'string', example: 'VALIDATION_ERROR' },
                  details: {
                    type: 'string',
                    example: 'One or more fields are invalid',
                  },
                },
              },
              meta: {
                type: 'object',
                properties: {
                  timestamp: {
                    type: 'string',
                    example: '2026-02-20T12:00:00.000Z',
                  },
                  requestId: {
                    type: 'string',
                    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                  },
                  version: { type: 'string', example: 'v1' },
                },
              },
            },
          },
        },
      },
      tags: [],
    };

    enforceUnifiedSchemas(doc);

    const json401 = getJsonMedia(doc, '/api/v1/realms', 'post', '401') as {
      example?: { message?: string; error?: { code?: string } };
    };
    const json403 = getJsonMedia(doc, '/api/v1/realms', 'post', '403') as {
      example?: { message?: string; error?: { code?: string } };
    };

    expect(json401.example?.message).toBe('Unauthorized');
    expect(json401.example?.error?.code).toBe('UNAUTHORIZED');
    expect(json403.example?.message).toBe('Forbidden');
    expect(json403.example?.error?.code).toBe('FORBIDDEN');
  });
});
