import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../../platform/prisma/prisma.module';
import { CreateKpiUseCase } from './create-probation-kpi.usecase';
import { DeleteKpiUseCase } from './delete-probation-kpi.usecase';
import { ProbationKpiController } from './probation-kpi.controller';
import {
  GetKpiByIdUseCase,
  ListAllKpisUseCase,
  ListPaginatedKpisUseCase,
} from './query-probation-kpi.usecase';
import { UpdateKpiUseCase } from './update-probation-kpi.usecase';

@Module({
  imports: [PrismaModule],
  controllers: [ProbationKpiController],
  providers: [
    CreateKpiUseCase,
    DeleteKpiUseCase,
    GetKpiByIdUseCase,
    ListAllKpisUseCase,
    ListPaginatedKpisUseCase,
    UpdateKpiUseCase,
  ],
})
export class ProbationKpiModule {}
