import { Module } from '@nestjs/common';
import { ContractsController } from './contracts.controller';
import { CreateContractUseCase } from './create-contract.usecase';
import { UpdateContractUseCase } from './update-contract.usecase';
import {
  GetContractByIdUseCase,
  ListAllContractsUseCase,
  ListPaginatedContractsUseCase,
} from './query-contract.usecase';
import { DeleteContractUseCase } from './delete-contract.usecase';
import { SignContractUseCase } from './sign-contract.usecase';

import { ContractTypeModule } from './contract-type/contract-type.module';
import { ContractTemplateModule } from './contract-template/contract-template.module';

@Module({
  imports: [ContractTypeModule, ContractTemplateModule],
  controllers: [ContractsController],
  providers: [
    CreateContractUseCase,
    UpdateContractUseCase,
    ListAllContractsUseCase,
    ListPaginatedContractsUseCase,
    GetContractByIdUseCase,
    DeleteContractUseCase,
    SignContractUseCase,
  ],
  exports: [GetContractByIdUseCase, SignContractUseCase],
})
export class ContractsModule {}
