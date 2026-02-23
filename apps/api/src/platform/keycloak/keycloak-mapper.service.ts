import { Injectable } from '@nestjs/common';
import { env } from '../../config/env.config';
import { AuthPrincipal } from '../../shared/interfaces/auth-principal.interface';
import { KeycloakTokenPayload } from './keycloak.types';

@Injectable()
export class KeycloakMapperService {
  toPrincipal(payload: KeycloakTokenPayload, realm: string): AuthPrincipal {
    const resourceRoles = Object.values(payload.resource_access ?? {}).flatMap(
      (resource) => resource.roles ?? [],
    );
    const realmRoles = payload.realm_access?.roles ?? [];
    const roles = [...new Set([...realmRoles, ...resourceRoles])];

    const scopes = payload.scope?.split(' ').filter(Boolean) ?? [];

    return {
      sub: String(payload.sub ?? ''),
      email: payload.email ?? payload.preferred_username ?? '',
      username: payload.preferred_username,
      realm,
      policyVersion: env.AUTH_POLICY_VERSION,
      roles,
      permissions: [],
      scopes,
      sessionId: payload.session_state,
      clientId: payload.azp,
    };
  }
}
