import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { buildErrorEnvelope, ErrorCode } from '../dto/response-envelope.dto';
import { getOrCreateRequestId } from '../utils/request.util';

/** Map HTTP status code (number) to envelope ErrorCode. */
const STATUS_TO_CODE: Record<number, ErrorCode> = {
  [HttpStatus.BAD_REQUEST]: ErrorCode.BAD_REQUEST,
  [HttpStatus.UNAUTHORIZED]: ErrorCode.UNAUTHORIZED,
  [HttpStatus.FORBIDDEN]: ErrorCode.FORBIDDEN,
  [HttpStatus.NOT_FOUND]: ErrorCode.NOT_FOUND,
  [HttpStatus.CONFLICT]: ErrorCode.CONFLICT,
  [HttpStatus.METHOD_NOT_ALLOWED]: ErrorCode.METHOD_NOT_ALLOWED,
  [HttpStatus.UNPROCESSABLE_ENTITY]: ErrorCode.UNPROCESSABLE_ENTITY,
  [HttpStatus.TOO_MANY_REQUESTS]: ErrorCode.TOO_MANY_REQUESTS,
  [HttpStatus.INTERNAL_SERVER_ERROR]: ErrorCode.INTERNAL_SERVER_ERROR,
  [HttpStatus.BAD_GATEWAY]: ErrorCode.BAD_GATEWAY,
  [HttpStatus.SERVICE_UNAVAILABLE]: ErrorCode.SERVICE_UNAVAILABLE,
  [HttpStatus.GATEWAY_TIMEOUT]: ErrorCode.GATEWAY_TIMEOUT,
};

const STATUS_TO_MESSAGE: Record<number, string> = {
  [HttpStatus.BAD_REQUEST]: 'Bad request',
  [HttpStatus.UNAUTHORIZED]: 'Unauthorized',
  [HttpStatus.FORBIDDEN]: 'Forbidden',
  [HttpStatus.NOT_FOUND]: 'Resource not found',
  [HttpStatus.CONFLICT]: 'Conflict',
  [HttpStatus.METHOD_NOT_ALLOWED]: 'Method not allowed',
  [HttpStatus.UNPROCESSABLE_ENTITY]: 'Unprocessable entity',
  [HttpStatus.TOO_MANY_REQUESTS]: 'Too many requests',
  [HttpStatus.INTERNAL_SERVER_ERROR]: 'Internal server error',
  [HttpStatus.BAD_GATEWAY]: 'Bad gateway',
  [HttpStatus.SERVICE_UNAVAILABLE]: 'Service unavailable',
  [HttpStatus.GATEWAY_TIMEOUT]: 'Gateway timeout',
};

const BAD_REQUEST_STATUS = 400;

/** Parse ValidationPipe-style message array into fieldErrors (e.g. "email must be an email" -> { field: "email", message: "..." }). */
function parseFieldErrors(
  messages: string[],
): { field: string; message: string }[] {
  return messages.map((msg) => {
    const mustIndex = msg.indexOf(' must ');
    if (mustIndex > 0) {
      return { field: msg.slice(0, mustIndex).trim(), message: msg };
    }
    const mustBeIndex = msg.indexOf(' must be ');
    if (mustBeIndex > 0) {
      return { field: msg.slice(0, mustBeIndex).trim(), message: msg };
    }
    return { field: 'field', message: msg };
  });
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const requestId = getOrCreateRequestId(request);

    const status: number =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let code: ErrorCode =
      STATUS_TO_CODE[status] ?? ErrorCode.INTERNAL_SERVER_ERROR;
    const defaultMessage = STATUS_TO_MESSAGE[status] ?? 'Internal server error';
    let message = defaultMessage;
    let details: string | undefined;
    let fieldErrors: { field: string; message: string }[] | undefined;

    if (exception instanceof HttpException) {
      const body = exception.getResponse();
      if (typeof body === 'string') {
        message = body;
        details = body;
      } else if (body && typeof body === 'object') {
        const o = body as Record<string, unknown>;
        if (Array.isArray(o.message)) {
          const msgs = o.message as string[];
          message =
            status === BAD_REQUEST_STATUS
              ? 'Validation failed'
              : defaultMessage;
          details = 'One or more fields are invalid';
          fieldErrors = parseFieldErrors(msgs);
          if (status === BAD_REQUEST_STATUS && fieldErrors.length > 0) {
            code = ErrorCode.VALIDATION_ERROR;
          }
        } else if (typeof o.message === 'string') {
          message = o.message;
          details = o.message;
        }
        if (o.details && typeof o.details === 'string') details = o.details;
        if (Array.isArray(o.fieldErrors)) {
          fieldErrors = (
            o.fieldErrors as { field: string; message: string }[]
          ).map((e) => ({
            field: e.field ?? 'field',
            message:
              typeof e.message === 'string'
                ? e.message
                : String(e?.message ?? 'Invalid value'),
          }));
          if (status === BAD_REQUEST_STATUS) {
            code = ErrorCode.VALIDATION_ERROR;
          }
        }
      }
    } else {
      details =
        exception instanceof Error
          ? exception.message
          : 'An unexpected error occurred';
      message = defaultMessage;
    }

    const envelope = buildErrorEnvelope(
      message,
      code,
      requestId,
      details,
      fieldErrors,
    );

    response.status(status).json(envelope);
  }
}
