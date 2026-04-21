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

const makeReflector = (roles: string[], scopes: string[] = []): Reflector =>
  ({
    getAllAndOverride: jest
      .fn()
      .mockReturnValueOnce(roles)
      .mockReturnValueOnce(scopes),
  }) as unknown as Reflector;

describe('RbacGuard', () => {
  it('allows access when no roles or scopes required', () => {
    const guard = new RbacGuard(makeReflector([], []));
    const context = createContext({ roles: [], permissions: [], scopes: [] });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('allows access when literal role name matches token roles', () => {
    const guard = new RbacGuard(makeReflector(['user:view']));
    const context = createContext({
      roles: ['user:view'],
      scopes: [],
      permissions: [],
    });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('allows hr_manager to access employee:view via snapshot permissions', () => {
    const guard = new RbacGuard(makeReflector(['employee:view']));
    const context = createContext({
      roles: ['hr_manager'],
      permissions: ['employee:*', 'department:*'],
      scopes: [],
    });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('allows hr_manager to access employee:view via baseline fallback when permissions empty', () => {
    const guard = new RbacGuard(makeReflector(['employee:view']));
    const context = createContext({
      roles: ['hr_manager'],
      permissions: [],
      scopes: [],
    });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('allows hr user to access leave:view via baseline fallback', () => {
    const guard = new RbacGuard(makeReflector(['leave:view']));
    const context = createContext({
      roles: ['hr'],
      permissions: [],
      scopes: [],
    });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('allows hr_assistant limited access but denies broader HR actions', () => {
    const allowGuard = new RbacGuard(makeReflector(['employee:view']));
    const allowCtx = createContext({
      roles: ['hr_assistant'],
      permissions: [],
      scopes: [],
    });
    expect(allowGuard.canActivate(allowCtx)).toBe(true);

    const denyGuard = new RbacGuard(makeReflector(['employee:terminate']));
    const denyCtx = createContext({
      roles: ['hr_assistant'],
      permissions: [],
      scopes: [],
    });
    expect(() => denyGuard.canActivate(denyCtx)).toThrow(ForbiddenException);
  });

  it('allows superadmin access to any permission', () => {
    const guard = new RbacGuard(makeReflector(['system_role:delete']));
    const context = createContext({
      roles: ['superadmin'],
      permissions: [],
      scopes: [],
    });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('denies access when user has no matching role or permission', () => {
    const guard = new RbacGuard(makeReflector(['employee:view']));
    const context = createContext({
      roles: ['crm_agent'],
      permissions: [],
      scopes: [],
    });
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('denies access when required scope is missing', () => {
    const guard = new RbacGuard(makeReflector([], ['token:introspect']));
    const context = createContext({ roles: [], permissions: [], scopes: [] });
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('throws when no user context is present', () => {
    const guard = new RbacGuard(makeReflector(['employee:view']));
    const context = createContext({} as never);
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
