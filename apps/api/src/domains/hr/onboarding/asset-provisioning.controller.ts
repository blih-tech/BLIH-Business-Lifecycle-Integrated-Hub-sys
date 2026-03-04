import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import type {
  CreateAssetProvisioningDto,
  UpdateAssetProvisioningDto,
} from '@repo/types';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { AssetProvisioningPermissions } from '../../../core/rbac/constants/permissions.constants';
import { Audit } from '../../../shared/decorators/audit.decorator';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { ApiProtected } from '../../../shared/docs/openapi';
import { KeycloakAuthGuard } from '../../../shared/guards/keycloak-auth.guard';
import { RbacGuard } from '../../../shared/guards/rbac.guard';
import { ApproveAssetProvisioningUseCase } from './use-cases/approve-asset-provisioning.usecase';
import { CreateAssetProvisioningUseCase } from './use-cases/create-asset-provisioning.usecase';
import { GetAssetProvisioningUseCase } from './use-cases/get-asset-provisioning.usecase';
import { ListAssetProvisioningUseCase } from './use-cases/list-asset-provisioning.usecase';
import { UpdateAssetProvisioningUseCase } from './use-cases/update-asset-provisioning.usecase';

@ApiTags('HR Onboarding Assets')
@Controller('hr/onboarding/asset-provisioning')
@UseGuards(KeycloakAuthGuard, RbacGuard)
export class AssetProvisioningController {
  constructor(
    private readonly createUseCase: CreateAssetProvisioningUseCase,
    private readonly listUseCase: ListAssetProvisioningUseCase,
    private readonly getUseCase: GetAssetProvisioningUseCase,
    private readonly updateUseCase: UpdateAssetProvisioningUseCase,
    private readonly approveUseCase: ApproveAssetProvisioningUseCase,
  ) {}

  @Post()
  @Roles(AssetProvisioningPermissions.CREATE)
  @Audit('onboarding.asset_provisioning.create', 'hr.asset_provisioning')
  @ApiProtected({
    path: '/api/v1/hr/onboarding/asset-provisioning',
    roles: [AssetProvisioningPermissions.CREATE],
  })
  @ApiOperation({ summary: 'Create asset provisioning request' })
  @ApiBody({ schema: { type: 'object' } })
  create(@Body() body: CreateAssetProvisioningDto) {
    return this.createUseCase.execute(body);
  }

  @Get()
  @Roles(AssetProvisioningPermissions.VIEW)
  @Audit('onboarding.asset_provisioning.list', 'hr.asset_provisioning')
  @ApiProtected({
    path: '/api/v1/hr/onboarding/asset-provisioning',
    roles: [AssetProvisioningPermissions.VIEW],
  })
  list(
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: string,
  ) {
    return this.listUseCase.execute({ employeeId, status });
  }

  @Get(':id')
  @Roles(AssetProvisioningPermissions.VIEW)
  @Audit('onboarding.asset_provisioning.get', 'hr.asset_provisioning')
  @ApiProtected({
    path: '/api/v1/hr/onboarding/asset-provisioning/:id',
    roles: [AssetProvisioningPermissions.VIEW],
  })
  @ApiParam({ name: 'id' })
  get(@Param('id') id: string) {
    return this.getUseCase.execute(id);
  }

  @Patch(':id')
  @Roles(AssetProvisioningPermissions.UPDATE)
  @Audit('onboarding.asset_provisioning.update', 'hr.asset_provisioning')
  @ApiProtected({
    path: '/api/v1/hr/onboarding/asset-provisioning/:id',
    roles: [AssetProvisioningPermissions.UPDATE],
  })
  @ApiParam({ name: 'id' })
  @ApiBody({ schema: { type: 'object' } })
  update(@Param('id') id: string, @Body() body: UpdateAssetProvisioningDto) {
    return this.updateUseCase.execute(id, body);
  }

  @Post(':id/approve')
  @Roles(AssetProvisioningPermissions.APPROVE)
  @Audit('onboarding.asset_provisioning.approve', 'hr.asset_provisioning')
  @ApiProtected({
    path: '/api/v1/hr/onboarding/asset-provisioning/:id/approve',
    roles: [AssetProvisioningPermissions.APPROVE],
  })
  @ApiParam({ name: 'id' })
  @ApiBody({ schema: { type: 'object', required: ['role'] } })
  approve(
    @Param('id') id: string,
    @Body()
    body: {
      role: 'IT_SUPERVISOR' | 'ADMIN' | 'FINANCE';
      approvedAt?: string | null;
    },
  ) {
    return this.approveUseCase.execute(id, body);
  }
}
