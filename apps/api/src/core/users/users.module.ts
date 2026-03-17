import { Module } from '@nestjs/common';
import { KeycloakModule } from '../../platform/keycloak/keycloak.module';
import { UserProfileController } from './user-profile.controller';
import { UsersController } from './users.controller';
import { CreateUserCompensationHistoryUseCase } from './use-cases/create-user-compensation-history.usecase';
import { CreateCompensationComponentUseCase } from './use-cases/create-compensation-component.usecase';
import { CreateUserUseCase } from './use-cases/create-user.usecase';
import { DeleteCompensationComponentUseCase } from './use-cases/delete-compensation-component.usecase';
import { DisableUserUseCase } from './use-cases/disable-user.usecase';
import { GetUserCompensationUseCase } from './use-cases/get-user-compensation.usecase';
import { GetUserEmploymentUseCase } from './use-cases/get-user-employment.usecase';
import { GetUserLifecycleUseCase } from './use-cases/get-user-lifecycle.usecase';
import { GetUserProfileUseCase } from './use-cases/get-user-profile.usecase';
import { ListCompensationComponentsUseCase } from './use-cases/list-compensation-components.usecase';
import { ListUsersUseCase } from './use-cases/list-users.usecase';
import { ListUserCompensationHistoryUseCase } from './use-cases/list-user-compensation-history.usecase';
import { ResetPasswordUseCase } from './use-cases/reset-password.usecase';
import { UpdateCompensationComponentUseCase } from './use-cases/update-compensation-component.usecase';
import { UpdateUserCompensationUseCase } from './use-cases/update-user-compensation.usecase';
import { UpdateUserEmploymentUseCase } from './use-cases/update-user-employment.usecase';
import { UpdateUserLifecycleUseCase } from './use-cases/update-user-lifecycle.usecase';
import { UpdateUserProfileUseCase } from './use-cases/update-user-profile.usecase';
import { UpdateUserUseCase } from './use-cases/update-user.usecase';

@Module({
  imports: [KeycloakModule],
  controllers: [UsersController, UserProfileController],
  providers: [
    CreateUserUseCase,
    UpdateUserUseCase,
    DisableUserUseCase,
    ResetPasswordUseCase,
    ListUsersUseCase,
    GetUserProfileUseCase,
    UpdateUserProfileUseCase,
    GetUserEmploymentUseCase,
    UpdateUserEmploymentUseCase,
    GetUserCompensationUseCase,
    UpdateUserCompensationUseCase,
    ListCompensationComponentsUseCase,
    CreateCompensationComponentUseCase,
    UpdateCompensationComponentUseCase,
    DeleteCompensationComponentUseCase,
    ListUserCompensationHistoryUseCase,
    CreateUserCompensationHistoryUseCase,
    GetUserLifecycleUseCase,
    UpdateUserLifecycleUseCase,
  ],
  exports: [ListUsersUseCase],
})
export class UsersModule {}
