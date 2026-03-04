import { Module } from '@nestjs/common';
import { ResourcesController } from './resources.controller';
import { CreateResourceUseCase } from './usecases/create-resource.usecase';
import { DeleteResourceUseCase } from './usecases/delete-resource.usecase';
import { GetResourceUseCase } from './usecases/get-resource.usecase';
import { ListResourcesUseCase } from './usecases/list-resources.usecase';
import { UpdateResourceUseCase } from './usecases/update-resource.usecase';

@Module({
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
