import { Module } from '@nestjs/common';
import { EmployeesController } from './employees/employees.controller';
import { ListEmployeesUseCase } from './employees/use-cases/list-employees.usecase';
import { GetEmployeeFullUseCase } from './employees/use-cases/get-employee-full.usecase';
import { EmployeeDocumentsController } from './documents/employee-documents.controller';
import { ListEmployeeDocumentsUseCase } from './documents/use-cases/list-employee-documents.usecase';
import { CreateEmployeeDocumentUseCase } from './documents/use-cases/create-employee-document.usecase';
import { UpdateEmployeeDocumentUseCase } from './documents/use-cases/update-employee-document.usecase';
import { EmployeeContractsController } from './contracts/employee-contracts.controller';
import { ListEmployeeContractsUseCase } from './contracts/use-cases/list-employee-contracts.usecase';
import { CreateContractUseCase } from './contracts/use-cases/create-contract.usecase';
import { UpdateContractUseCase } from './contracts/use-cases/update-contract.usecase';
import { JobDescriptionsController } from './job-descriptions/job-descriptions.controller';
import { ListJobDescriptionsUseCase } from './job-descriptions/use-cases/list-job-descriptions.usecase';
import { GetJobDescriptionUseCase } from './job-descriptions/use-cases/get-job-description.usecase';
import { CreateJobDescriptionUseCase } from './job-descriptions/use-cases/create-job-description.usecase';
import { UpdateJobDescriptionUseCase } from './job-descriptions/use-cases/update-job-description.usecase';
import { DocumentExpiryJob } from './jobs/document-expiry.job';

@Module({
  controllers: [
    EmployeesController,
    EmployeeDocumentsController,
    EmployeeContractsController,
    JobDescriptionsController,
  ],
  providers: [
    ListEmployeesUseCase,
    GetEmployeeFullUseCase,
    ListEmployeeDocumentsUseCase,
    CreateEmployeeDocumentUseCase,
    UpdateEmployeeDocumentUseCase,
    ListEmployeeContractsUseCase,
    CreateContractUseCase,
    UpdateContractUseCase,
    ListJobDescriptionsUseCase,
    GetJobDescriptionUseCase,
    CreateJobDescriptionUseCase,
    UpdateJobDescriptionUseCase,
    DocumentExpiryJob,
  ],
})
export class HrModule {}
