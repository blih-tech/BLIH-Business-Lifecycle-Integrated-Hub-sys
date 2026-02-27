import { Module } from '@nestjs/common';
import { DepartmentsController } from './departments.controller';
import { CreateDepartmentUseCase } from './use-cases/create-department.usecase';
import { DeleteDepartmentUseCase } from './use-cases/delete-department.usecase';
import { GetDepartmentUseCase } from './use-cases/get-department.usecase';
import { ListDepartmentsUseCase } from './use-cases/list-departments.usecase';
import { UpdateDepartmentUseCase } from './use-cases/update-department.usecase';

@Module({
  controllers: [DepartmentsController],
  providers: [
    CreateDepartmentUseCase,
    ListDepartmentsUseCase,
    GetDepartmentUseCase,
    UpdateDepartmentUseCase,
    DeleteDepartmentUseCase,
  ],
})
export class DepartmentsModule {}
