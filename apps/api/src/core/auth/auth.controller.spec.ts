import { Logger } from '@nestjs/common';
import type { Request } from 'express';
import { AuthController } from './auth.controller';

describe('AuthController', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('logs structured auth metadata with request context', () => {
    const controller = new AuthController(
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );
    const loggerSpy = jest
      .spyOn(Logger.prototype, 'log')
      .mockImplementation(() => undefined);
    const request = {
      ip: '10.0.0.10',
      headers: {
        'user-agent': 'jest-agent',
        'x-correlation-id': 'req-123',
        'x-forwarded-for': '203.0.113.5, 10.0.0.10',
      },
    } as unknown as Request;

    (
      controller as never as {
        logAuthEvent: (
          req: Request,
          action: string,
          metadata?: Record<string, unknown>,
        ) => void;
      }
    ).logAuthEvent(request, 'auth.login.success', {
      subject: 'kc-user-1',
      reason: 'ok',
    });

    const payload = JSON.parse(loggerSpy.mock.calls[0]?.[0] as string) as {
      action: string;
      timestamp: string;
      requestId: string;
      ipAddress: string;
      userAgent: string;
      subject: string;
      reason: string;
    };

    expect(payload.action).toBe('auth.login.success');
    expect(payload.timestamp).toBeTruthy();
    expect(payload.requestId).toBe('req-123');
    expect(payload.ipAddress).toBe('203.0.113.5');
    expect(payload.userAgent).toBe('jest-agent');
    expect(payload.subject).toBe('kc-user-1');
    expect(payload.reason).toBe('ok');
  });
});
