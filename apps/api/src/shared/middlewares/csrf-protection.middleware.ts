import { ForbiddenException, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { AUTH_COOKIE_NAMES, readCookie } from '../../core/auth/utils/oidc.util';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

@Injectable()
export class CsrfProtectionMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction): void {
    if (SAFE_METHODS.has(req.method.toUpperCase())) {
      next();
      return;
    }

    const accessCookie = readCookie(req, AUTH_COOKIE_NAMES.access);
    const refreshCookie = readCookie(req, AUTH_COOKIE_NAMES.refresh);
    if (!accessCookie && !refreshCookie) {
      next();
      return;
    }

    const csrfCookie = readCookie(req, AUTH_COOKIE_NAMES.csrf);
    const headerValue = this.readHeader(req.headers['x-csrf-token']);
    if (!csrfCookie || !headerValue || csrfCookie !== headerValue) {
      throw new ForbiddenException('Invalid or missing CSRF token');
    }

    next();
  }

  private readHeader(value: string | string[] | undefined): string | undefined {
    if (Array.isArray(value)) {
      return value[0];
    }

    return value;
  }
}
