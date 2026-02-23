import { Injectable } from '@nestjs/common';
import { env } from '../../../config/env.config';
import { KeycloakIntrospectionService } from '../../../platform/keycloak/keycloak-introspection.service';
import { TokenResponseDto } from '../dto/token-response.dto';

@Injectable()
export class IntrospectTokenUseCase {
  constructor(
    private readonly introspectionService: KeycloakIntrospectionService,
  ) {}

  async execute(token: string, realm: string): Promise<TokenResponseDto> {
    const data = await this.introspectionService.introspect(token, realm);

    return {
      active: data.active,
      policyVersion: env.AUTH_POLICY_VERSION,
      sub: data.sub,
      email: data.username,
      scopes: data.scope?.split(' ').filter(Boolean) ?? [],
      roles: [],
      permissions: [],
    };
  }
}
