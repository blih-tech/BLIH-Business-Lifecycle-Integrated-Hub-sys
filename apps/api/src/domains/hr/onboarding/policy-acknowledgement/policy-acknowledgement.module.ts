import { Module } from '@nestjs/common';
import { PolicyAcknowledgementController } from './policy-acknowledgement.controller';
import { CreatePolicyAcknowledgementUseCase } from './create-policy-acknowledgement.usecase';
import {
  GetPolicyAcknowledgementByIdUseCase,
  ListAllPolicyAcknowledgementUseCase,
  ListPaginatedPolicyAcknowledgementUseCase,
} from './query-policy-acknowledgement.usecase';
import { UpdatePolicyAcknowledgementUseCase } from './update-policy-acknowledgement.usecase';

@Module({
  controllers: [PolicyAcknowledgementController],
  providers: [
    CreatePolicyAcknowledgementUseCase,
    UpdatePolicyAcknowledgementUseCase,
    ListAllPolicyAcknowledgementUseCase,
    ListPaginatedPolicyAcknowledgementUseCase,
    GetPolicyAcknowledgementByIdUseCase,
  ],
})
export class PolicyAcknowledgementModule {}
