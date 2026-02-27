import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
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
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { CreateResourceUseCase } from './usecases/create-resource.usecase';
import { DeleteResourceUseCase } from './usecases/delete-resource.usecase';
import { GetResourceUseCase } from './usecases/get-resource.usecase';
import { ListResourcesUseCase } from './usecases/list-resources.usecase';
import { UpdateResourceUseCase } from './usecases/update-resource.usecase';

@ApiTags('RBAC')
@Controller('rbac')
@UseGuards(KeycloakAuthGuard, RbacGuard)
export class ResourcesController {
  constructor(
    private readonly listResourcesUseCase: ListResourcesUseCase,
    private readonly getResourceUseCase: GetResourceUseCase,
    private readonly createResourceUseCase: CreateResourceUseCase,
    private readonly updateResourceUseCase: UpdateResourceUseCase,
    private readonly deleteResourceUseCase: DeleteResourceUseCase,
  ) {}

  @Get('resources')
  @Roles(SystemResourcePermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/rbac/resources',
    roles: [SystemResourcePermissions.VIEW],
  })
  @ApiOperation({
    summary: 'List resources',
    description: 'Lists RBAC permission resources.',
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
    description: 'Returns a single RBAC resource by id.',
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

  @Post('resources')
  @Roles(SystemResourcePermissions.CREATE)
  @ApiProtected({
    path: '/api/v1/rbac/resources',
    roles: [SystemResourcePermissions.CREATE],
  })
  @ApiOperation({
    summary: 'Create resource',
    description: 'Creates a new resource. Resource name is immutable.',
  })
  @ApiBody({ type: CreateResourceDto })
  createResource(@Body() dto: CreateResourceDto) {
    return this.createResourceUseCase.execute(dto);
  }

  @Put('resources/:resourceId')
  @Roles(SystemResourcePermissions.UPDATE)
  @ApiProtected({
    path: '/api/v1/rbac/resources/:resourceId',
    roles: [SystemResourcePermissions.UPDATE],
  })
  @ApiOperation({
    summary: 'Update resource',
    description:
      'Updates resource description only. Resource name is immutable.',
  })
  @ApiParam({
    name: 'resourceId',
    description: 'Resource id.',
    example: '8b76752b-df18-45bc-af74-1ea9a0db2e40',
  })
  @ApiBody({ type: UpdateResourceDto })
  updateResource(
    @Param('resourceId') resourceId: string,
    @Body() dto: UpdateResourceDto,
  ) {
    return this.updateResourceUseCase.execute(resourceId, dto);
  }

  @Delete('resources/:resourceId')
  @Roles(SystemResourcePermissions.DELETE)
  @ApiProtected({
    path: '/api/v1/rbac/resources/:resourceId',
    roles: [SystemResourcePermissions.DELETE],
  })
  @ApiOperation({
    summary: 'Delete resource',
    description: 'Deletes a resource and cascades linked permissions.',
  })
  @ApiParam({
    name: 'resourceId',
    description: 'Resource id.',
    example: '8b76752b-df18-45bc-af74-1ea9a0db2e40',
  })
  deleteResource(@Param('resourceId') resourceId: string) {
    return this.deleteResourceUseCase.execute(resourceId);
  }
}
