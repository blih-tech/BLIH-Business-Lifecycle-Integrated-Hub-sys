import { Module } from '@nestjs/common';
import { NotificationsModule } from '../../../core/notifications/notifications.module';
import { UserProvisioningService } from '../../../core/users/user-provisioning.service';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import { EmployeesController } from './employees.controller';
import { EmployeeRecordsController } from './employee-records.controller';
import { CreateEmployeeUseCase } from './use-cases/create-employee.usecase';
import {
  GetEmployeeFullUseCase,
  ListAllEmployeesUseCase,
  ListPaginatedEmployeesUseCase,
} from './use-cases/list-employees.usecase';
import { UpdateEmployeeUseCase } from './use-cases/update-employee.usecase';
import { GetUserProfileUseCase } from '../../../core/users/use-cases/get-user-profile.usecase';
import { UpdateUserProfileUseCase } from '../../../core/users/use-cases/update-user-profile.usecase';
import { GetUserEmploymentUseCase } from '../../../core/users/use-cases/get-user-employment.usecase';
import { UpdateUserEmploymentUseCase } from '../../../core/users/use-cases/update-user-employment.usecase';
import { GetUserLifecycleUseCase } from '../../../core/users/use-cases/get-user-lifecycle.usecase';
import { UpdateUserLifecycleUseCase } from '../../../core/users/use-cases/update-user-lifecycle.usecase';
import { GetUserCompensationUseCase } from '../../../core/users/use-cases/get-user-compensation.usecase';
import { UpdateUserCompensationUseCase } from '../../../core/users/use-cases/update-user-compensation.usecase';
import { ListUserCompensationHistoryUseCase } from '../../../core/users/use-cases/list-user-compensation-history.usecase';
import { ListCompensationComponentsUseCase } from '../../../core/users/use-cases/list-compensation-components.usecase';
import { CreateCompensationComponentUseCase } from '../../../core/users/use-cases/create-compensation-component.usecase';
import { UpdateCompensationComponentUseCase } from '../../../core/users/use-cases/update-compensation-component.usecase';
import { DeleteCompensationComponentUseCase } from '../../../core/users/use-cases/delete-compensation-component.usecase';

@Module({
  imports: [NotificationsModule],
  controllers: [EmployeesController, EmployeeRecordsController],
  providers: [
    PrismaService,
    UserProvisioningService,
    CreateEmployeeUseCase,
    UpdateEmployeeUseCase,
    ListAllEmployeesUseCase,
    ListPaginatedEmployeesUseCase,
    GetEmployeeFullUseCase,
    GetUserProfileUseCase,
    UpdateUserProfileUseCase,
    GetUserEmploymentUseCase,
    UpdateUserEmploymentUseCase,
    GetUserLifecycleUseCase,
    UpdateUserLifecycleUseCase,
    GetUserCompensationUseCase,
    UpdateUserCompensationUseCase,
    ListUserCompensationHistoryUseCase,
    ListCompensationComponentsUseCase,
    CreateCompensationComponentUseCase,
    UpdateCompensationComponentUseCase,
    DeleteCompensationComponentUseCase,
  ],
})
export class EmployeesModule {}
