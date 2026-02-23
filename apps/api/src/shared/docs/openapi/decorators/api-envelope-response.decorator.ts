import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { ApiSuccessEnvelopeMetaDto } from '../dto/api-success-envelope.dto';
import { PaginationMetaDto } from '../dto/pagination.dto';

type JsonSchema = Record<string, unknown>;

function envelopeSchema(
  dataSchema: JsonSchema,
  paginated = false,
): Record<string, unknown> {
  return {
    type: 'object',
    required: ['success', 'message', 'data', 'error', 'meta'],
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Request processed successfully' },
      data: dataSchema,
      error: { type: 'null', nullable: true, example: null },
      meta: paginated
        ? {
            allOf: [{ $ref: getSchemaPath(ApiSuccessEnvelopeMetaDto) }],
            properties: {
              pagination: { $ref: getSchemaPath(PaginationMetaDto) },
            },
          }
        : { $ref: getSchemaPath(ApiSuccessEnvelopeMetaDto) },
    },
  };
}

export function ApiEnvelopeOkResponse<TModel extends Type<unknown>>(
  model: TModel,
  description = 'Request processed successfully.',
) {
  return applyDecorators(
    ApiExtraModels(ApiSuccessEnvelopeMetaDto, model),
    ApiOkResponse({
      description,
      schema: envelopeSchema({ $ref: getSchemaPath(model) }),
    }),
  );
}

export function ApiEnvelopeCreatedResponse<TModel extends Type<unknown>>(
  model: TModel,
  description = 'Resource created successfully.',
) {
  return applyDecorators(
    ApiExtraModels(ApiSuccessEnvelopeMetaDto, model),
    ApiCreatedResponse({
      description,
      schema: envelopeSchema({ $ref: getSchemaPath(model) }),
    }),
  );
}

export function ApiEnvelopeArrayResponse<TModel extends Type<unknown>>(
  model: TModel,
  description = 'Request processed successfully.',
) {
  return applyDecorators(
    ApiExtraModels(ApiSuccessEnvelopeMetaDto, model),
    ApiOkResponse({
      description,
      schema: envelopeSchema({
        type: 'array',
        items: { $ref: getSchemaPath(model) },
      }),
    }),
  );
}

export function ApiEnvelopePaginatedResponse<TModel extends Type<unknown>>(
  model: TModel,
  description = 'Paginated response.',
) {
  return applyDecorators(
    ApiExtraModels(ApiSuccessEnvelopeMetaDto, PaginationMetaDto, model),
    ApiOkResponse({
      description,
      schema: envelopeSchema(
        {
          type: 'array',
          items: { $ref: getSchemaPath(model) },
        },
        true,
      ),
    }),
  );
}
