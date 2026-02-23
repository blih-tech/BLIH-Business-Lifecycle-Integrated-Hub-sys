import { Module } from '@nestjs/common';
import { KeycloakModule } from './keycloak/keycloak.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, KeycloakModule],
  exports: [PrismaModule, KeycloakModule],
})
export class PlatformModule {}
