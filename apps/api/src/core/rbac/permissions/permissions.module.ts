import { Module } from '@nestjs/common';
import { RbacSharedModule } from '../rbac-shared.module';
import { PermissionsController } from './permissions.controller';
import { CreatePermissionUseCase } from './usecases/create-permission.usecase';
import { DeletePermissionUseCase } from './usecases/delete-permission.usecase';
import { GetPermissionUseCase } from './usecases/get-permission.usecase';
import { ListPermissionsUseCase } from './usecases/list-permissions.usecase';
import { UpdatePermissionUseCase } from './usecases/update-permission.usecase';

@Module({
  imports: [RbacSharedModule],
  controllers: [PermissionsController],
  providers: [
    ListPermissionsUseCase,
    GetPermissionUseCase,
    CreatePermissionUseCase,
    UpdatePermissionUseCase,
    DeletePermissionUseCase,
  ],
})
export class PermissionsModule {}
