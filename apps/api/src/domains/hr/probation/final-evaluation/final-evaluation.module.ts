import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../../platform/prisma/prisma.module';
import { FinalEvaluationController } from './final-evaluation.controller';
import { CreateFinalEvaluationUseCase } from './create-final-evaluation.usecase';
import { DeleteFinalEvaluationUseCase } from './delete-final-evaluation.usecase';
import {
  GetFinalEvaluationByIdUseCase,
  GetFinalEvaluationByProbationUseCase,
} from './query-final-evaluation.usecase';
import { UpdateFinalEvaluationUseCase } from './update-final-evaluation.usecase';

@Module({
  imports: [PrismaModule],
  controllers: [FinalEvaluationController],
  providers: [
    CreateFinalEvaluationUseCase,
    GetFinalEvaluationByIdUseCase,
    GetFinalEvaluationByProbationUseCase,
    UpdateFinalEvaluationUseCase,
    DeleteFinalEvaluationUseCase,
  ],
})
export class FinalEvaluationModule {}
