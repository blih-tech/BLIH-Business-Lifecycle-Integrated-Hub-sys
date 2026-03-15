import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { env } from '../../config/env.config';

@Injectable()
export class AuthRateLimitService {
  private readonly loginLimiter = new RateLimiterMemory({
    points: env.AUTH_LOGIN_RATE_LIMIT_POINTS,
    duration: env.AUTH_LOGIN_RATE_LIMIT_WINDOW_SECONDS,
  });

  async consumeLoginAttempt(ipAddress: string): Promise<void> {
    try {
      await this.loginLimiter.consume(ipAddress);
    } catch {
      throw new HttpException(
        'Too many login attempts. Please try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }
}
