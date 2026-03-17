import { HttpException, HttpStatus } from '@nestjs/common';
import { resetEnvCache } from '../../config/env.config';
import { AuthRateLimitService } from './auth-rate-limit.service';

describe('AuthRateLimitService', () => {
  const originalPoints = process.env.AUTH_LOGIN_RATE_LIMIT_POINTS;
  const originalWindowSeconds =
    process.env.AUTH_LOGIN_RATE_LIMIT_WINDOW_SECONDS;

  afterEach(() => {
    if (originalPoints === undefined) {
      delete process.env.AUTH_LOGIN_RATE_LIMIT_POINTS;
    } else {
      process.env.AUTH_LOGIN_RATE_LIMIT_POINTS = originalPoints;
    }

    if (originalWindowSeconds === undefined) {
      delete process.env.AUTH_LOGIN_RATE_LIMIT_WINDOW_SECONDS;
    } else {
      process.env.AUTH_LOGIN_RATE_LIMIT_WINDOW_SECONDS = originalWindowSeconds;
    }

    resetEnvCache();
  });

  it('enforces the configured login attempt limit per ip address', async () => {
    process.env.AUTH_LOGIN_RATE_LIMIT_POINTS = '1';
    process.env.AUTH_LOGIN_RATE_LIMIT_WINDOW_SECONDS = '60';
    resetEnvCache();

    const service = new AuthRateLimitService();

    await expect(
      service.consumeLoginAttempt('203.0.113.10'),
    ).resolves.toBeUndefined();
    await expect(
      service.consumeLoginAttempt('203.0.113.10'),
    ).rejects.toMatchObject(
      new HttpException(
        'Too many login attempts. Please try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      ),
    );
  });
});
