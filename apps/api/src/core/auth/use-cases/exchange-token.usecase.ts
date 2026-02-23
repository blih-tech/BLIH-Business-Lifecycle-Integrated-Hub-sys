import { Injectable } from '@nestjs/common';
import { env } from '../../../config/env.config';
import { KeycloakTokenService } from '../../../platform/keycloak/keycloak-token.service';
import { TokenResponseDto } from '../dto/token-response.dto';

@Injectable()
export class ExchangeTokenUseCase {
  constructor(private readonly tokenService: KeycloakTokenService) {}

  async execute(
    token: string,
    realm: string,
    requestedSubject?: string,
  ): Promise<TokenResponseDto> {
    const exchanged = await this.tokenService.exchangeToken(
      token,
      requestedSubject,
      realm,
    );

    return {
      active: true,
      policyVersion: env.AUTH_POLICY_VERSION,
      scopes: exchanged.scope?.split(' ').filter(Boolean) ?? [],
      roles: [],
      permissions: [],
      accessToken: exchanged.access_token,
      refreshToken: exchanged.refresh_token,
    };
  }
}
