import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiCookieAuth, ApiExtension } from '@nestjs/swagger';
import {
  SWAGGER_BEARER_AUTH_NAME,
  SWAGGER_COOKIE_AUTH_NAME,
} from '../openapi.constants';
import {
  ApiForbiddenError,
  ApiUnauthorizedError,
} from './api-common-errors.decorator';

export interface ApiProtectedOptions {
  path: string;
  roles?: string[];
  scopes?: string[];
}

export function ApiProtected(options: ApiProtectedOptions) {
  const roles = options.roles ?? [];
  const scopes = options.scopes ?? [];

  return applyDecorators(
    ApiBearerAuth(SWAGGER_BEARER_AUTH_NAME),
    ApiCookieAuth(SWAGGER_COOKIE_AUTH_NAME),
    ApiUnauthorizedError(
      options.path,
      'Unauthorized: missing or invalid kc_access cookie or bearer access token',
    ),
    ApiForbiddenError(
      options.path,
      roles.length > 0 || scopes.length > 0
        ? `Forbidden: required ${
            roles.length > 0 ? `roles [${roles.join(', ')}]` : ''
          }${
            roles.length > 0 && scopes.length > 0 ? ' and ' : ''
          }${scopes.length > 0 ? `scopes [${scopes.join(', ')}]` : ''}`
        : 'Forbidden: authenticated principal does not have required access',
    ),
    ApiExtension('x-required-roles', roles),
    ApiExtension('x-required-scopes', scopes),
  );
}
