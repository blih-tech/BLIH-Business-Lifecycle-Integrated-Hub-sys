import { Injectable } from '@nestjs/common';
import { DataScopeLevel } from '../../config/data-scope-roles.constant';
import { AuthPrincipal } from '../interfaces/auth-principal.interface';

export type ScopeFilter = Record<string, string>;

/**
 * Formalizes data-scope logic for roles with dataScope: GLOBAL or SELF.
 * Apply the returned filter when querying (e.g. "only own records" for SELF).
 */
@Injectable()
export class DataScopeService {
  private readonly scopeOrder: DataScopeLevel[] = ['global', 'self'];

  getSelfFilter(
    principal: AuthPrincipal,
    field = 'userId',
  ): Record<string, string> {
    return { [field]: principal.sub };
  }

  resolveScope(
    principal: AuthPrincipal,
    roleScopeMap: Record<string, DataScopeLevel>,
    fallback: DataScopeLevel = 'global',
  ): DataScopeLevel {
    const principalRoles = new Set(
      (principal.roles ?? []).map((role) => role.toLowerCase()),
    );

    const resolved = Object.entries(roleScopeMap)
      .filter(([role]) => principalRoles.has(role.toLowerCase()))
      .map(([, scope]) => scope);

    if (resolved.length === 0) {
      return fallback;
    }

    return (
      this.scopeOrder.find((scope) => resolved.includes(scope)) ?? fallback
    );
  }

  getScopeFilter(
    principal: AuthPrincipal,
    roleScopeMap: Record<string, DataScopeLevel>,
    selfField = 'userId',
  ): ScopeFilter | null {
    const scope = this.resolveScope(principal, roleScopeMap);
    if (scope === 'global') {
      return null;
    }
    return this.getSelfFilter(principal, selfField);
  }
}
