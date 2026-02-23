import { Module } from '@nestjs/common';
import { ActionsController } from './actions.controller';
import { GetActionUseCase } from './usecases/get-action.usecase';
import { ListActionsUseCase } from './usecases/list-actions.usecase';

@Module({
  controllers: [ActionsController],
  providers: [ListActionsUseCase, GetActionUseCase],
})
export class ActionsModule {}
