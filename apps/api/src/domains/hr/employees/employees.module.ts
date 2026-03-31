import { Module } from '@nestjs/common';
import { SendNotificationUseCase } from '../../../core/notifications/use-cases/send-notification.usecase';
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

@Module({
  controllers: [EmployeesController, EmployeeRecordsController],
  providers: [
    PrismaService,
    UserProvisioningService,
    SendNotificationUseCase,
    CreateEmployeeUseCase,
    UpdateEmployeeUseCase,
    ListAllEmployeesUseCase,
    ListPaginatedEmployeesUseCase,
    GetEmployeeFullUseCase,
  ],
})
export class EmployeesModule {}
