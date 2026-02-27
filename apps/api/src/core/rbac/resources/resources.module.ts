import { Module } from '@nestjs/common';
import { RbacSharedModule } from '../rbac-shared.module';
import { ResourcesController } from './resources.controller';
import { CreateResourceUseCase } from './usecases/create-resource.usecase';
import { DeleteResourceUseCase } from './usecases/delete-resource.usecase';
import { GetResourceUseCase } from './usecases/get-resource.usecase';
import { ListResourcesUseCase } from './usecases/list-resources.usecase';
import { UpdateResourceUseCase } from './usecases/update-resource.usecase';

@Module({
  imports: [RbacSharedModule],
  controllers: [ResourcesController],
  providers: [
    ListResourcesUseCase,
    GetResourceUseCase,
    CreateResourceUseCase,
    UpdateResourceUseCase,
    DeleteResourceUseCase,
  ],
})
export class ResourcesModule {}
