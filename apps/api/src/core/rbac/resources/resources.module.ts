import { Module } from '@nestjs/common';
import { ResourcesController } from './resources.controller';
import { GetResourceUseCase } from './usecases/get-resource.usecase';
import { ListResourcesUseCase } from './usecases/list-resources.usecase';

@Module({
  controllers: [ResourcesController],
  providers: [ListResourcesUseCase, GetResourceUseCase],
})
export class ResourcesModule {}
