import { Module } from '@nestjs/common';
import { RbacSharedModule } from '../rbac-shared.module';
import { RolesController } from './roles.controller';
import { AssignRoleUseCase } from './usecases/assign-role.usecase';
import { AddRolePermissionsUseCase } from './usecases/add-role-permissions.usecase';
import { CreateRoleUseCase } from './usecases/create-role.usecase';
import { DeleteRoleUseCase } from './usecases/delete-role.usecase';
import { GetRoleUseCase } from './usecases/get-role.usecase';
import { ListRolesUseCase } from './usecases/list-roles.usecase';
import { RemoveRolePermissionsUseCase } from './usecases/remove-role-permissions.usecase';
import { ReplaceRolePermissionsUseCase } from './usecases/replace-role-permissions.usecase';
import { RevokeRoleUseCase } from './usecases/revoke-role.usecase';
import { UpdateRoleUseCase } from './usecases/update-role.usecase';

@Module({
  imports: [RbacSharedModule],
  controllers: [RolesController],
  providers: [
    CreateRoleUseCase,
    AssignRoleUseCase,
    AddRolePermissionsUseCase,
    RemoveRolePermissionsUseCase,
    ReplaceRolePermissionsUseCase,
    RevokeRoleUseCase,
    ListRolesUseCase,
    GetRoleUseCase,
    UpdateRoleUseCase,
    DeleteRoleUseCase,
  ],
})
export class RolesModule {}
