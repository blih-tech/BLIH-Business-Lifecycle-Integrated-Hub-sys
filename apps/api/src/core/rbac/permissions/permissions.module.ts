import { Module } from '@nestjs/common';
import { PermissionsController } from './permissions.controller';
import { GetPermissionUseCase } from './usecases/get-permission.usecase';
import { ListPermissionsUseCase } from './usecases/list-permissions.usecase';

@Module({
  controllers: [PermissionsController],
  providers: [ListPermissionsUseCase, GetPermissionUseCase],
})
export class PermissionsModule {}
