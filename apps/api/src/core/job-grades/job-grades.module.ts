import { Module } from '@nestjs/common';
import { JobGradesController } from './job-grades.controller';
import { CreateJobGradeUseCase } from './use-cases/create-job-grade.usecase';
import { ListJobGradesUseCase } from './use-cases/list-job-grades.usecase';
import { GetJobGradeUseCase } from './use-cases/get-job-grade.usecase';
import { UpdateJobGradeUseCase } from './use-cases/update-job-grade.usecase';
import { DeleteJobGradeUseCase } from './use-cases/delete-job-grade.usecase';

@Module({
  controllers: [JobGradesController],
  providers: [
    CreateJobGradeUseCase,
    ListJobGradesUseCase,
    GetJobGradeUseCase,
    UpdateJobGradeUseCase,
    DeleteJobGradeUseCase,
  ],
})
export class JobGradesModule {}
