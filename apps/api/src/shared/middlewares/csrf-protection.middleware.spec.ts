import { ForbiddenException } from '@nestjs/common';
import type { Request, Response } from 'express';
import { CsrfProtectionMiddleware } from './csrf-protection.middleware';

const createRequest = (
  method: string,
  cookie?: string,
  csrfHeader?: string | string[],
) =>
  ({
    method,
    headers: {
      ...(cookie ? { cookie } : {}),
      ...(csrfHeader ? { 'x-csrf-token': csrfHeader } : {}),
    },
  }) as unknown as Request;

describe('CsrfProtectionMiddleware', () => {
  const middleware = new CsrfProtectionMiddleware();
  const response = {} as Response;
  const next = jest.fn();

  beforeEach(() => {
    next.mockClear();
  });

  it('bypasses safe methods', () => {
    middleware.use(
      createRequest('GET', 'kc_refresh=refresh-token; kc_csrf=csrf-token'),
      response,
      next,
    );

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('bypasses requests without authentication cookies', () => {
    middleware.use(
      createRequest('POST', 'kc_csrf=csrf-token', 'csrf-token'),
      response,
      next,
    );

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('accepts matching csrf cookie and header values', () => {
    middleware.use(
      createRequest(
        'POST',
        'kc_refresh=refresh-token; kc_csrf=csrf-token',
        'csrf-token',
      ),
      response,
      next,
    );

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('rejects mismatched csrf values for cookie-authenticated requests', () => {
    expect(() =>
      middleware.use(
        createRequest(
          'POST',
          'kc_refresh=refresh-token; kc_csrf=csrf-token',
          'different-token',
        ),
        response,
        next,
      ),
    ).toThrow(ForbiddenException);
    expect(next).not.toHaveBeenCalled();
  });
});
