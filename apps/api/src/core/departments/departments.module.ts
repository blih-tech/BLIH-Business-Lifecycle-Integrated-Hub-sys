import { Module } from '@nestjs/common';
import { DepartmentsController } from './departments.controller';
import { CreateDepartmentUseCase } from './use-cases/create-department.usecase';
import { ListDepartmentsUseCase } from './use-cases/list-departments.usecase';

@Module({
  controllers: [DepartmentsController],
  providers: [CreateDepartmentUseCase, ListDepartmentsUseCase],
})
export class DepartmentsModule {}
