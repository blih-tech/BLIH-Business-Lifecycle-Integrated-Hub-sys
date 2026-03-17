import { ExecutionContext, InternalServerErrorException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { firstValueFrom, of } from 'rxjs';
import { ResponseMessage } from '../decorators/response-message.decorator';
import { ResponseEnvelopeInterceptor } from './response-envelope.interceptor';

function createContext(
  request: Record<string, unknown>,
  handler: () => unknown = () => undefined,
): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
    getHandler: () => handler,
    getClass: () => class TestController {},
  } as unknown as ExecutionContext;
}

describe('ResponseEnvelopeInterceptor', () => {
  let interceptor: ResponseEnvelopeInterceptor;

  beforeEach(() => {
    interceptor = new ResponseEnvelopeInterceptor(new Reflector());
  });

  it('wraps object responses in unified envelope', async () => {
    const context = createContext({
      headers: { 'x-correlation-id': 'req-1' },
    });

    const result = await firstValueFrom(
      interceptor.intercept(context, { handle: () => of({ ok: true }) }),
    );

    expect(result).toMatchObject({
      success: true,
      message: 'Request processed successfully',
      data: { ok: true },
      error: null,
      meta: {
        requestId: 'req-1',
        version: 'v1',
      },
    });
    expect((result as { meta: { timestamp: string } }).meta.timestamp).toEqual(
      expect.any(String),
    );
  });

  it('wraps array responses in unified envelope', async () => {
    const context = createContext({
      headers: { 'x-correlation-id': 'req-2' },
    });

    const result = await firstValueFrom(
      interceptor.intercept(context, { handle: () => of([1, 2, 3]) }),
    );

    expect(result).toMatchObject({
      success: true,
      data: [1, 2, 3],
      error: null,
      meta: {
        requestId: 'req-2',
      },
    });
  });

  it('uses route-specific success messages when metadata is present', async () => {
    class TestController {
      @ResponseMessage('User created successfully')
      static createUser() {
        return undefined;
      }
    }

    const context = createContext(
      {
        headers: { 'x-correlation-id': 'req-2b' },
      },
      TestController.createUser,
    );

    const result = await firstValueFrom(
      interceptor.intercept(context, { handle: () => of({ id: 'u1' }) }),
    );

    expect(result).toMatchObject({
      success: true,
      message: 'User created successfully',
      data: { id: 'u1' },
    });
  });

  it('maps PaginatedResult items into data and pagination into meta.pagination', async () => {
    const context = createContext({
      headers: { 'x-correlation-id': 'req-3' },
    });

    const result = await firstValueFrom(
      interceptor.intercept(context, {
        handle: () =>
          of({
            items: [{ id: 'u1' }],
            pagination: {
              page: 1,
              limit: 10,
              total: 25,
              totalPages: 3,
              hasNextPage: true,
              hasPreviousPage: false,
            },
          }),
      }),
    );

    expect(result).toMatchObject({
      success: true,
      data: [{ id: 'u1' }],
      meta: {
        requestId: 'req-3',
        pagination: {
          page: 1,
          limit: 10,
          totalItems: 25,
          totalPages: 3,
          hasNextPage: true,
          hasPreviousPage: false,
        },
      },
    });
  });

  it('rejects legacy paginated shape', async () => {
    const context = createContext({
      headers: { 'x-correlation-id': 'req-4' },
    });

    await expect(
      firstValueFrom(
        interceptor.intercept(context, {
          handle: () =>
            of({
              data: [{ id: 'u1' }],
              meta: {
                page: 1,
                limit: 10,
                total: 25,
                totalPages: 3,
              },
            }),
        }),
      ),
    ).rejects.toBeInstanceOf(InternalServerErrorException);
  });
});
