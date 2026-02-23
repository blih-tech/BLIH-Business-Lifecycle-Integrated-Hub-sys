import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiQuery,
  getSchemaPath,
} from '@nestjs/swagger';
import { ApiSuccessEnvelopeMetaDto } from '../dto/api-success-envelope.dto';
import { PaginationMetaDto } from '../dto/pagination.dto';

export function ApiPaginationQuery() {
  return applyDecorators(
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      example: 1,
      description: '1-based page index.',
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      example: 20,
      description: 'Number of records per page (max: 100).',
    }),
    ApiQuery({
      name: 'sortBy',
      required: false,
      type: String,
      example: 'createdAt',
      description: 'Field used to sort the result set.',
    }),
    ApiQuery({
      name: 'sortOrder',
      required: false,
      enum: ['asc', 'desc'],
      example: 'desc',
      description: 'Sort direction.',
    }),
  );
}

export function ApiPaginatedResponse<TModel extends Type<unknown>>(
  model: TModel,
  description = 'Paginated response.',
) {
  return applyDecorators(
    ApiExtraModels(ApiSuccessEnvelopeMetaDto, PaginationMetaDto, model),
    ApiOkResponse({
      description,
      schema: {
        type: 'object',
        required: ['success', 'message', 'data', 'error', 'meta'],
        properties: {
          success: { type: 'boolean', example: true },
          message: {
            type: 'string',
            example: 'Request processed successfully',
          },
          data: {
            type: 'array',
            items: {
              $ref: getSchemaPath(model),
            },
          },
          error: { type: 'null', nullable: true, example: null },
          meta: {
            allOf: [{ $ref: getSchemaPath(ApiSuccessEnvelopeMetaDto) }],
            properties: {
              pagination: { $ref: getSchemaPath(PaginationMetaDto) },
            },
          },
        },
      },
    }),
  );
}
