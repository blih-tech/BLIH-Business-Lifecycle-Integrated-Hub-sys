import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { ApiDefaultErrors, ApiProtected } from '../../../shared/docs/openapi';
import { KeycloakAuthGuard } from '../../../shared/guards/keycloak-auth.guard';
import { RbacGuard } from '../../../shared/guards/rbac.guard';
import { SystemResourcePermissions } from '../constants/permissions.constants';
import { GetResourceUseCase } from './usecases/get-resource.usecase';
import { ListResourcesUseCase } from './usecases/list-resources.usecase';

@ApiTags('RBAC')
@Controller('rbac')
@UseGuards(KeycloakAuthGuard, RbacGuard)
export class ResourcesController {
  constructor(
    private readonly listResourcesUseCase: ListResourcesUseCase,
    private readonly getResourceUseCase: GetResourceUseCase,
  ) {}

  @Get('resources')
  @Roles(SystemResourcePermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/rbac/resources',
    roles: [SystemResourcePermissions.VIEW],
  })
  @ApiOperation({
    summary: 'List resources',
    description: 'Lists seeded RBAC permission resources.',
  })
  @ApiOkResponse({
    description: 'Permission resources.',
  })
  @ApiDefaultErrors({
    path: '/api/v1/rbac/resources',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  listResources() {
    return this.listResourcesUseCase.execute();
  }

  @Get('resources/:resourceId')
  @Roles(SystemResourcePermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/rbac/resources/:resourceId',
    roles: [SystemResourcePermissions.VIEW],
  })
  @ApiOperation({
    summary: 'Get resource',
    description: 'Returns a single seeded RBAC resource by id.',
  })
  @ApiParam({
    name: 'resourceId',
    description: 'Resource id.',
    example: '8b76752b-df18-45bc-af74-1ea9a0db2e40',
  })
  @ApiOkResponse({
    description: 'Permission resource.',
  })
  @ApiDefaultErrors({
    path: '/api/v1/rbac/resources/8b76752b-df18-45bc-af74-1ea9a0db2e40',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
    notFound: 'Permission resource not found',
  })
  getResource(@Param('resourceId') resourceId: string) {
    return this.getResourceUseCase.execute(resourceId);
  }
}
