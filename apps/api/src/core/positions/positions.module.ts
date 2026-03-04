import { Module } from '@nestjs/common';
import { PositionsController } from './positions.controller';
import { CreatePositionUseCase } from './use-cases/create-position.usecase';
import { DeletePositionUseCase } from './use-cases/delete-position.usecase';
import { GetPositionUseCase } from './use-cases/get-position.usecase';
import { ListPositionsUseCase } from './use-cases/list-positions.usecase';
import { UpdatePositionUseCase } from './use-cases/update-position.usecase';

@Module({
  controllers: [PositionsController],
  providers: [
    CreatePositionUseCase,
    ListPositionsUseCase,
    GetPositionUseCase,
    UpdatePositionUseCase,
    DeletePositionUseCase,
  ],
})
export class PositionsModule {}
