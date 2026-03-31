import { Module } from '@nestjs/common';
import { ContractTypeController } from './contract-type.controller';
import { CreateContractTypeUseCase } from './create-contract-type.usecase';
import { UpdateContractTypeUseCase } from './update-contract-type.usecase';
import {
  GetContractTypeByIdUseCase,
  ListAllContractTypesUseCase,
  ListPaginatedContractTypesUseCase,
} from './query-contract-type.usecase';
import { DeleteContractTypeUseCase } from './delete-contract-type.usecase';

@Module({
  controllers: [ContractTypeController],
  providers: [
    CreateContractTypeUseCase,
    UpdateContractTypeUseCase,
    ListAllContractTypesUseCase,
    ListPaginatedContractTypesUseCase,
    GetContractTypeByIdUseCase,
    DeleteContractTypeUseCase,
  ],
  exports: [
    GetContractTypeByIdUseCase, // Exported in case other modules need to confirm type existence.
  ],
})
export class ContractTypeModule {}
