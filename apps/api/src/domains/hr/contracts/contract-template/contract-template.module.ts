import { Module } from '@nestjs/common';
import { ContractTemplateController } from './contract-template.controller';
import { CreateContractTemplateUseCase } from './create-contract-template.usecase';
import { UpdateContractTemplateUseCase } from './update-contract-template.usecase';
import {
  GetContractTemplateByIdUseCase,
  ListAllContractTemplatesUseCase,
  ListPaginatedContractTemplatesUseCase,
} from './query-contract-template.usecase';
import { DeleteContractTemplateUseCase } from './delete-contract-template.usecase';

@Module({
  controllers: [ContractTemplateController],
  providers: [
    CreateContractTemplateUseCase,
    UpdateContractTemplateUseCase,
    ListAllContractTemplatesUseCase,
    ListPaginatedContractTemplatesUseCase,
    GetContractTemplateByIdUseCase,
    DeleteContractTemplateUseCase,
  ],
  exports: [GetContractTemplateByIdUseCase],
})
export class ContractTemplateModule {}
