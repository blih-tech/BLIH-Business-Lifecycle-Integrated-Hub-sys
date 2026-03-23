import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../../platform/prisma/prisma.module';
import { CheckpointEvaluationController } from './checkpoint-evaluation.controller';
import { CreateCheckpointEvaluationUseCase } from './create-checkpoint-evaluation.usecase';
import { DeleteCheckpointEvaluationUseCase } from './delete-checkpoint-evaluation.usecase';
import {
  GetCheckpointEvaluationByIdUseCase,
  GetEvaluationByCheckpointUseCase,
  ListEvaluationsByProbationUseCase,
} from './query-checkpoint-evaluation.usecase';
import { UpdateCheckpointEvaluationUseCase } from './update-checkpoint-evaluation.usecase';

@Module({
  imports: [PrismaModule],
  controllers: [CheckpointEvaluationController],
  providers: [
    CreateCheckpointEvaluationUseCase,
    GetCheckpointEvaluationByIdUseCase,
    GetEvaluationByCheckpointUseCase,
    ListEvaluationsByProbationUseCase,
    UpdateCheckpointEvaluationUseCase,
    DeleteCheckpointEvaluationUseCase,
  ],
})
export class CheckpointEvaluationModule {}
