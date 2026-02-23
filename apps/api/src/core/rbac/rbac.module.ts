import { Global, Module } from '@nestjs/common';
import { KeycloakModule } from '../../platform/keycloak/keycloak.module';
import { ActionsModule } from './actions/actions.module';
import { PermissionsModule } from './permissions/permissions.module';
import { RbacSharedModule } from './rbac-shared.module';
import { ResourcesModule } from './resources/resources.module';
import { RolesModule } from './roles/roles.module';

@Global()
@Module({
  imports: [
    KeycloakModule,
    RbacSharedModule,
    RolesModule,
    PermissionsModule,
    ResourcesModule,
    ActionsModule,
  ],
  exports: [RbacSharedModule],
})
export class RbacModule {}
