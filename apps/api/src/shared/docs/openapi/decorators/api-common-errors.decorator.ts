import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ApiErrorResponseDto } from '../dto/api-error-response.dto';
import { createEnvelopeErrorExample } from '../openapi.examples';

export function ApiUnauthorizedError(path: string, message: string) {
  return ApiUnauthorizedResponse({
    type: ApiErrorResponseDto,
    description: 'Authentication failure.',
    schema: {
      example: createEnvelopeErrorExample({
        message: 'Unauthorized',
        code: 'UNAUTHORIZED',
        details: message,
      }),
    },
  });
}

export function ApiForbiddenError(path: string, message: string) {
  return ApiForbiddenResponse({
    type: ApiErrorResponseDto,
    description: 'Authorization failure.',
    schema: {
      example: createEnvelopeErrorExample({
        message: 'Forbidden',
        code: 'FORBIDDEN',
        details: message,
      }),
    },
  });
}

export function ApiValidationError(
  path: string,
  // Kept for API compatibility with ApiDefaultErrors; example uses fixed fieldErrors.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  error: string | Record<string, unknown>,
) {
  return ApiBadRequestResponse({
    type: ApiErrorResponseDto,
    description: `Request validation error (${path}).`,
    schema: {
      example: createEnvelopeErrorExample({
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: 'One or more fields are invalid',
        fieldErrors: [
          { field: 'email', message: 'Invalid email format' },
          {
            field: 'password',
            message: 'Password must be at least 8 characters',
          },
        ],
      }),
    },
  });
}

export function ApiNotFoundError(path: string, message: string) {
  return ApiNotFoundResponse({
    type: ApiErrorResponseDto,
    description: 'Requested resource was not found.',
    schema: {
      example: createEnvelopeErrorExample({
        message: 'Resource not found',
        code: 'NOT_FOUND',
        details: message,
      }),
    },
  });
}

export function ApiConflictError(path: string, message: string) {
  return ApiConflictResponse({
    type: ApiErrorResponseDto,
    description: `Request conflict (${path}).`,
    schema: {
      example: createEnvelopeErrorExample({
        message: 'Conflict',
        code: 'CONFLICT',
        details: message,
      }),
    },
  });
}

export interface ApiDefaultErrorOptions {
  path: string;
  badRequest?: string | Record<string, unknown>;
  unauthorized?: string;
  forbidden?: string;
  notFound?: string;
  conflict?: string;
}

export function ApiDefaultErrors(options: ApiDefaultErrorOptions) {
  const decorators: Array<MethodDecorator | ClassDecorator> = [];

  if (options.badRequest) {
    decorators.push(ApiValidationError(options.path, options.badRequest));
  }

  if (options.unauthorized) {
    decorators.push(ApiUnauthorizedError(options.path, options.unauthorized));
  }

  if (options.forbidden) {
    decorators.push(ApiForbiddenError(options.path, options.forbidden));
  }

  if (options.notFound) {
    decorators.push(ApiNotFoundError(options.path, options.notFound));
  }

  if (options.conflict) {
    decorators.push(ApiConflictError(options.path, options.conflict));
  }

  return applyDecorators(...decorators);
}
