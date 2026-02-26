import { Injectable } from '@nestjs/common';
import { env } from '../../../config/env.config';
import { KeycloakTokenService } from '../../../platform/keycloak/keycloak-token.service';
import { KeycloakMapperService } from '../../../platform/keycloak/keycloak-mapper.service';
import { UserPermissionSnapshotService } from '../../rbac/user-permission-snapshot.service';
import { TokenResponseDto } from '../dto/token-response.dto';

@Injectable()
export class ValidateTokenUseCase {
  constructor(
    private readonly tokenService: KeycloakTokenService,
    private readonly mapper: KeycloakMapperService,
    private readonly userPermissionSnapshot: UserPermissionSnapshotService,
  ) {}

  async execute(token: string, realm: string): Promise<TokenResponseDto> {
    const payload = await this.tokenService.validateAccessToken(token, realm);
    const principal = this.mapper.toPrincipal(payload, realm);
    const permissions =
      await this.userPermissionSnapshot.getEffectivePermissionsByKeycloakId(
        principal.sub,
      );

    return {
      active: true,
      policyVersion: env.AUTH_POLICY_VERSION,
      sub: principal.sub,
      email: principal.email,
      scopes: principal.scopes,
      roles: principal.roles,
      permissions,
    };
  }
}
