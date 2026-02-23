import { Injectable } from '@nestjs/common';
import { KeycloakIntrospectionService } from '../../../platform/keycloak/keycloak-introspection.service';
import { KeycloakTokenService } from '../../../platform/keycloak/keycloak-token.service';

@Injectable()
export class RevokeSessionUseCase {
  constructor(
    private readonly tokenService: KeycloakTokenService,
    private readonly introspectionService: KeycloakIntrospectionService,
  ) {}

  async execute(
    token: string,
    realm: string,
    tokenTypeHint: 'refresh_token' | 'access_token' = 'refresh_token',
    reason?: string,
  ) {
    const introspection = await this.safeIntrospect(token, realm);
    await this.tokenService.revokeToken(token, realm, tokenTypeHint);

    const sessionId = introspection?.sid ?? introspection?.session_state;

    return {
      revoked: true,
      subject: introspection?.sub,
      sessionId,
      tokenTypeHint,
      reason: reason ?? 'logout',
    };
  }

  private async safeIntrospect(token: string, realm: string) {
    try {
      return await this.introspectionService.introspect(token, realm);
    } catch {
      return null;
    }
  }
}
