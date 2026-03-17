import { Module } from '@nestjs/common';
import { KeycloakModule } from '../../platform/keycloak/keycloak.module';
import { AuthController } from './auth.controller';
import { AuthRateLimitService } from './auth-rate-limit.service';
import { ExchangeTokenUseCase } from './use-cases/exchange-token.usecase';
import { IntrospectTokenUseCase } from './use-cases/introspect-token.usecase';
import { RevokeSessionUseCase } from './use-cases/revoke-session.usecase';
import { ValidateTokenUseCase } from './use-cases/validate-token.usecase';

@Module({
  imports: [KeycloakModule],
  controllers: [AuthController],
  providers: [
    ValidateTokenUseCase,
    IntrospectTokenUseCase,
    ExchangeTokenUseCase,
    RevokeSessionUseCase,
    AuthRateLimitService,
  ],
  exports: [ValidateTokenUseCase],
})
export class AuthModule {}
