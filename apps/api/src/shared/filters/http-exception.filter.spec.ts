import {
  ArgumentsHost,
  BadRequestException,
  HttpStatus,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { HttpExceptionFilter } from './http-exception.filter';

function createHost(requestHeaders: Record<string, string> = {}): {
  host: ArgumentsHost;
  response: {
    status: jest.MockedFunction<(code: number) => Response>;
    json: jest.MockedFunction<(body: unknown) => Response>;
  };
} {
  const response = {
    status: jest.fn() as jest.MockedFunction<(code: number) => Response>,
    json: jest.fn() as jest.MockedFunction<(body: unknown) => Response>,
  };
  response.status.mockReturnValue(response as unknown as Response);
  response.json.mockReturnValue(response as unknown as Response);

  const request = {
    headers: requestHeaders,
  } as unknown as Request;

  const host = {
    switchToHttp: () => ({
      getResponse: () => response as unknown as Response,
      getRequest: () => request,
    }),
  } as unknown as ArgumentsHost;

  return { host, response };
}

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
  });

  it('maps validation errors to VALIDATION_ERROR with fieldErrors', () => {
    const { host, response } = createHost({ 'x-correlation-id': 'req-10' });
    const exception = new BadRequestException({
      message: 'Validation failed',
      details: 'One or more fields are invalid',
      fieldErrors: [{ field: 'email', message: 'email must be an email' }],
    });

    filter.catch(exception, host);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    const payload = response.json.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(payload.success).toBe(false);
    expect(payload.message).toBe('Validation failed: email must be an email');
    expect(payload.data).toBeNull();

    const error = payload.error as Record<string, unknown>;
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.details).toBe('email must be an email');
    expect(error.fieldErrors).toEqual([
      { field: 'email', message: 'email must be an email' },
    ]);

    const meta = payload.meta as Record<string, unknown>;
    expect(meta.requestId).toBe('req-10');
    expect(meta.version).toBe('v1');
  });

  it('maps unauthorized exceptions to UNAUTHORIZED envelope', () => {
    const { host, response } = createHost({ 'x-correlation-id': 'req-11' });
    const exception = new UnauthorizedException('Invalid token');

    filter.catch(exception, host);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
    const payload = response.json.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(payload.success).toBe(false);
    expect(payload.message).toBe('Invalid token');
    const error = payload.error as Record<string, unknown>;
    expect(error.code).toBe('UNAUTHORIZED');
  });

  it('maps not found exceptions to NOT_FOUND envelope', () => {
    const { host, response } = createHost({ 'x-correlation-id': 'req-12' });
    const exception = new NotFoundException('User not found');

    filter.catch(exception, host);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    const payload = response.json.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(payload.success).toBe(false);
    expect(payload.message).toBe('User not found');
    const error = payload.error as Record<string, unknown>;
    expect(error.code).toBe('NOT_FOUND');
  });

  it('maps unknown errors to INTERNAL_SERVER_ERROR envelope', () => {
    const { host, response } = createHost({ 'x-correlation-id': 'req-13' });
    const exception = new Error('Unexpected crash');

    filter.catch(exception, host);

    expect(response.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    const payload = response.json.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(payload.success).toBe(false);
    expect(payload.message).toBe('Internal server error');
    const error = payload.error as Record<string, unknown>;
    expect(error.code).toBe('INTERNAL_SERVER_ERROR');
    expect(error.details).toBe('Unexpected crash');
  });
});
