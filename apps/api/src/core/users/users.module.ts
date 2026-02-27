import { Module } from '@nestjs/common';
import { KeycloakModule } from '../../platform/keycloak/keycloak.module';
import { RbacSharedModule } from '../rbac/rbac-shared.module';
import { UsersController } from './users.controller';
import { CreateUserUseCase } from './use-cases/create-user.usecase';
import { DisableUserUseCase } from './use-cases/disable-user.usecase';
import { ListAvailableUserPermissionsUseCase } from './use-cases/list-available-user-permissions.usecase';
import { ListUsersUseCase } from './use-cases/list-users.usecase';
import { ResetPasswordUseCase } from './use-cases/reset-password.usecase';
import { SetUserPermissionsUseCase } from './use-cases/set-user-permissions.usecase';
import { UpdateUserUseCase } from './use-cases/update-user.usecase';

@Module({
  imports: [KeycloakModule, RbacSharedModule],
  controllers: [UsersController],
  providers: [
    CreateUserUseCase,
    UpdateUserUseCase,
    DisableUserUseCase,
    ResetPasswordUseCase,
    ListUsersUseCase,
    SetUserPermissionsUseCase,
    ListAvailableUserPermissionsUseCase,
  ],
  exports: [ListUsersUseCase],
})
export class UsersModule {}
