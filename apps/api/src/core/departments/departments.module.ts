import { Module } from '@nestjs/common';
import { DepartmentsController } from './departments.controller';
import { ListDepartmentsUseCase } from './use-cases/list-departments.usecase';

@Module({
  controllers: [DepartmentsController],
  providers: [ListDepartmentsUseCase],
})
export class DepartmentsModule {}
