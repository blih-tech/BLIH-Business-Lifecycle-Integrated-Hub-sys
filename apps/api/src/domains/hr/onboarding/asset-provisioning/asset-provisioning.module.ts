import { Module } from '@nestjs/common';
import { AssetProvisioningController } from './asset-provisioning.controller';
import { CreateAssetProvisioningUseCase } from './create-asset-provisioning.usecase';
import {
  GetAssetProvisioningByIdUseCase,
  ListAllAssetProvisioningUseCase,
  ListPaginatedAssetProvisioningUseCase,
} from './query-asset-provisioning.usecase';
import { UpdateAssetProvisioningUseCase } from './update-asset-provisioning.usecase';

@Module({
  controllers: [AssetProvisioningController],
  providers: [
    CreateAssetProvisioningUseCase,
    UpdateAssetProvisioningUseCase,
    ListAllAssetProvisioningUseCase,
    ListPaginatedAssetProvisioningUseCase,
    GetAssetProvisioningByIdUseCase,
  ],
})
export class AssetProvisioningModule {}
