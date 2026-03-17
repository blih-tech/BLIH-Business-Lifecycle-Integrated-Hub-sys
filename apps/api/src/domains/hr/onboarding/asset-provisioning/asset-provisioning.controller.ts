import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { randomUUID } from 'crypto';
import { Roles } from '../../../../shared/decorators/roles.decorator';
import { KeycloakAuthGuard } from '../../../../shared/guards/keycloak-auth.guard';
import { RbacGuard } from '../../../../shared/guards/rbac.guard';
import { AssetProvisioningPermissions } from '../../../../core/rbac/constants/permissions.constants';
import {
  AssetProvisioningListQueryDto,
  CreateAssetProvisioningDto,
  UpdateAssetProvisioningDto,
} from './asset-provisioning.dto';
import {
  ApiAssetProvisioningTag,
  ApiCreateAssetProvisioning,
  ApiGetAssetProvisioningById,
  ApiListAllAssetProvisioning,
  ApiListPaginatedAssetProvisioning,
  ApiUpdateAssetProvisioning,
} from './asset-provisioning.docs';
import { CreateAssetProvisioningUseCase } from './create-asset-provisioning.usecase';
import {
  GetAssetProvisioningByIdUseCase,
  ListAllAssetProvisioningUseCase,
  ListPaginatedAssetProvisioningUseCase,
} from './query-asset-provisioning.usecase';
import { UpdateAssetProvisioningUseCase } from './update-asset-provisioning.usecase';

@ApiAssetProvisioningTag()
@Controller('hr/onboarding/asset-provisioning')
@UseGuards(KeycloakAuthGuard, RbacGuard)
export class AssetProvisioningController {
  constructor(
    private readonly createProvisioning: CreateAssetProvisioningUseCase,
    private readonly listAllProvisioning: ListAllAssetProvisioningUseCase,
    private readonly listPaginatedProvisioning: ListPaginatedAssetProvisioningUseCase,
    private readonly getProvisioningById: GetAssetProvisioningByIdUseCase,
    private readonly updateProvisioning: UpdateAssetProvisioningUseCase,
  ) {}

  @Post()
  @Roles(AssetProvisioningPermissions.CREATE)
  @ApiCreateAssetProvisioning()
  create(@Body() body: CreateAssetProvisioningDto) {
    return this.createProvisioning.execute(body);
  }

  @Get()
  @Roles(AssetProvisioningPermissions.VIEW)
  @ApiListAllAssetProvisioning()
  listAll(@Query() query: AssetProvisioningListQueryDto) {
    return this.listAllProvisioning.execute(query);
  }

  @Get('paginated')
  @Roles(AssetProvisioningPermissions.VIEW)
  @ApiListPaginatedAssetProvisioning()
  listPaginated(
    @Query() query: AssetProvisioningListQueryDto,
    @Req() req: Request,
  ) {
    const requestId =
      (req.headers['x-request-id'] as string | undefined) ?? randomUUID();
    return this.listPaginatedProvisioning.execute(query, requestId);
  }

  @Get(':id')
  @Roles(AssetProvisioningPermissions.VIEW)
  @ApiGetAssetProvisioningById()
  getById(@Param('id') id: string) {
    return this.getProvisioningById.execute(id);
  }

  @Patch(':id')
  @Roles(AssetProvisioningPermissions.UPDATE)
  @ApiUpdateAssetProvisioning()
  update(@Param('id') id: string, @Body() body: UpdateAssetProvisioningDto) {
    return this.updateProvisioning.execute(id, body);
  }
}
