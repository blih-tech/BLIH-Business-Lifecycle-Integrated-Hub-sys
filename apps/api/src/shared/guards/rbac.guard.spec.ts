import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RbacGuard } from './rbac.guard';
import { ExecutionContext } from '@nestjs/common';

const createContext = (user: {
  roles?: string[];
  permissions?: string[];
  scopes?: string[];
}): ExecutionContext =>
  ({
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
    getClass: () => ({}),
    getHandler: () => ({}),
  }) as unknown as ExecutionContext;

describe('RbacGuard', () => {
  it('allows access when role is present', () => {
    const reflector = {
      getAllAndOverride: jest
        .fn()
        .mockReturnValueOnce(['user:view'])
        .mockReturnValueOnce([]),
    } as unknown as Reflector;

    const guard = new RbacGuard(reflector);
    const context = createContext({
      roles: ['user:view'],
      scopes: [],
      permissions: [],
    });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('denies access when required scope is missing', () => {
    const reflector = {
      getAllAndOverride: jest
        .fn()
        .mockReturnValueOnce([])
        .mockReturnValueOnce(['token:introspect']),
    } as unknown as Reflector;

    const guard = new RbacGuard(reflector);
    const context = createContext({ roles: [], permissions: [], scopes: [] });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
