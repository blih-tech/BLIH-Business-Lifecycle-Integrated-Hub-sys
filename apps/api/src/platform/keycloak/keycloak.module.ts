import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { KeycloakAdminService } from './keycloak-admin.service';
import { KeycloakIntrospectionService } from './keycloak-introspection.service';
import { KeycloakMapperService } from './keycloak-mapper.service';
import { KeycloakTokenService } from './keycloak-token.service';
import { PrincipalEnrichmentService } from './principal-enrichment.service';

@Global()
@Module({
  imports: [
    ConfigModule,
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
      // Disable axios verbose logging
      headers: {
        'User-Agent': 'blih-system-backend/1.0.0',
      },
    }),
    PrismaModule,
  ],
  providers: [
    KeycloakAdminService,
    KeycloakTokenService,
    KeycloakIntrospectionService,
    KeycloakMapperService,
    PrincipalEnrichmentService,
  ],
  exports: [
    KeycloakAdminService,
    KeycloakTokenService,
    KeycloakIntrospectionService,
    KeycloakMapperService,
    PrincipalEnrichmentService,
  ],
})
export class KeycloakModule {}
