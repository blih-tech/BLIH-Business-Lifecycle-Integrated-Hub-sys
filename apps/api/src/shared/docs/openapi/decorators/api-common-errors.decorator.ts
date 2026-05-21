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

function parseFieldError(message: string): { field: string; message: string } {
  const mustIndex = message.indexOf(' must ');
  if (mustIndex > 0) {
    return { field: message.slice(0, mustIndex).trim(), message };
  }

  const shouldIndex = message.indexOf(' should ');
  if (shouldIndex > 0) {
    return { field: message.slice(0, shouldIndex).trim(), message };
  }

  return { field: 'field', message };
}

function buildValidationExample(error: string | Record<string, unknown>) {
  if (typeof error === 'string') {
    return createEnvelopeErrorExample({
      message: `Validation failed: ${error}`,
      code: 'VALIDATION_ERROR',
      details: error,
      fieldErrors: [parseFieldError(error)],
    });
  }

  const rawMessage = error.message;
  const messages = Array.isArray(rawMessage)
    ? rawMessage.filter((value): value is string => typeof value === 'string')
    : typeof rawMessage === 'string'
      ? [rawMessage]
      : [];

  const primaryError = messages[0] ?? 'Invalid request data';

  return createEnvelopeErrorExample({
    message: `Validation failed: ${primaryError}`,
    code: 'VALIDATION_ERROR',
    details:
      messages.length > 1
        ? `${messages.length} fields are invalid. Review fieldErrors for the complete list.`
        : primaryError,
    fieldErrors:
      messages.length > 0 ? messages.map(parseFieldError) : undefined,
  });
}

export function ApiUnauthorizedError(_path: string, message: string) {
  return ApiUnauthorizedResponse({
    type: ApiErrorResponseDto,
    description: message,
    schema: {
      example: createEnvelopeErrorExample({
        message,
        code: 'UNAUTHORIZED',
        details: message,
      }),
    },
  });
}

export function ApiForbiddenError(_path: string, message: string) {
  return ApiForbiddenResponse({
    type: ApiErrorResponseDto,
    description: message,
    schema: {
      example: createEnvelopeErrorExample({
        message,
        code: 'FORBIDDEN',
        details: message,
      }),
    },
  });
}

export function ApiValidationError(
  path: string,
  error: string | Record<string, unknown>,
) {
  return ApiBadRequestResponse({
    type: ApiErrorResponseDto,
    description:
      typeof error === 'string' ? error : `Request validation error (${path}).`,
    schema: {
      example: buildValidationExample(error),
    },
  });
}

export function ApiNotFoundError(_path: string, message: string) {
  return ApiNotFoundResponse({
    type: ApiErrorResponseDto,
    description: message,
    schema: {
      example: createEnvelopeErrorExample({
        message,
        code: 'NOT_FOUND',
        details: message,
      }),
    },
  });
}

export function ApiConflictError(_path: string, message: string) {
  return ApiConflictResponse({
    type: ApiErrorResponseDto,
    description: message,
    schema: {
      example: createEnvelopeErrorExample({
        message,
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
