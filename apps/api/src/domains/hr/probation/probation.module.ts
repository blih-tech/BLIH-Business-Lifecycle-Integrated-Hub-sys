import { Module } from '@nestjs/common';
import { CheckpointEvaluationModule } from './checkpoint-evaluation/checkpoint-evaluation.module';
import { FinalEvaluationModule } from './final-evaluation/final-evaluation.module';
import { ProbationKpiModule } from './probation-kpi/probation-kpi.module';
import { ProbationController } from './probation.controller';
import { CreateProbationUseCase } from './create-probation.usecase';
import { DeleteProbationUseCase } from './delete-probation.usecase';
import {
  GetProbationByIdUseCase,
  ListAllProbationUseCase,
  ListPaginatedProbationUseCase,
} from './query-probation.usecase';
import { UpdateProbationUseCase } from './update-probation.usecase';

@Module({
  imports: [ProbationKpiModule, CheckpointEvaluationModule, FinalEvaluationModule],
  controllers: [ProbationController],
  providers: [
    CreateProbationUseCase,
    UpdateProbationUseCase,
    DeleteProbationUseCase,
    ListAllProbationUseCase,
    ListPaginatedProbationUseCase,
    GetProbationByIdUseCase,
  ],
})
export class ProbationModule {}
