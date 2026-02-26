import { Module } from '@nestjs/common';
import { RbacSharedModule } from '../rbac-shared.module';
import { ActionsController } from './actions.controller';
import { CreateActionUseCase } from './usecases/create-action.usecase';
import { DeleteActionUseCase } from './usecases/delete-action.usecase';
import { GetActionUseCase } from './usecases/get-action.usecase';
import { ListActionsUseCase } from './usecases/list-actions.usecase';
import { UpdateActionUseCase } from './usecases/update-action.usecase';

@Module({
  imports: [RbacSharedModule],
  controllers: [ActionsController],
  providers: [
    ListActionsUseCase,
    GetActionUseCase,
    CreateActionUseCase,
    UpdateActionUseCase,
    DeleteActionUseCase,
  ],
})
export class ActionsModule {}
