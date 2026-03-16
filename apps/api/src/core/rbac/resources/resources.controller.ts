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
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { ResponseMessage } from '../../../shared/decorators/response-message.decorator';
import { ApiDefaultErrors, ApiProtected } from '../../../shared/docs/openapi';
import { KeycloakAuthGuard } from '../../../shared/guards/keycloak-auth.guard';
import { RbacGuard } from '../../../shared/guards/rbac.guard';
import { SystemResourcePermissions } from '@repo/types/rbac';
import { CreateResourceDto } from './dto/create-resource.dto';
import { ResourceResponseDto } from './dto/resource-response.dto';
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

  @Post('resources')
  @Roles(SystemResourcePermissions.CREATE)
  @ApiProtected({
    path: '/api/v1/rbac/resources',
    roles: [SystemResourcePermissions.CREATE],
  })
  @ApiOperation({
    summary: 'Create resource',
    description:
      'Creates a permission resource entry that can be combined with actions to form permission slugs.',
  })
  @ApiBody({
    type: CreateResourceDto,
    examples: {
      createResource: {
        summary: 'Create resource payload',
        value: {
          name: 'invoice',
          description: 'Invoice lifecycle management resource.',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Permission resource created successfully.',
    type: ResourceResponseDto,
  })
  @ApiDefaultErrors({
    path: '/api/v1/rbac/resources',
    badRequest: 'Resource name already exists',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  @ResponseMessage('Permission resource created successfully')
  createResource(@Body() dto: CreateResourceDto) {
    return this.createResourceUseCase.execute(dto);
  }

  @Get('resources')
  @Roles(SystemResourcePermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/rbac/resources',
    roles: [SystemResourcePermissions.VIEW],
  })
  @ApiOperation({
    summary: 'List resources',
    description:
      'Returns permission resources sorted alphabetically by resource name.',
  })
  @ApiOkResponse({
    description: 'Permission resources sorted by name.',
    type: ResourceResponseDto,
    isArray: true,
  })
  @ApiDefaultErrors({
    path: '/api/v1/rbac/resources',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  @ResponseMessage('Permission resources retrieved successfully')
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
    description: 'Returns a single permission resource by its identifier.',
  })
  @ApiParam({
    name: 'resourceId',
    description: 'Resource id.',
    example: '8b76752b-df18-45bc-af74-1ea9a0db2e40',
  })
  @ApiOkResponse({
    description: 'Permission resource details.',
    type: ResourceResponseDto,
  })
  @ApiDefaultErrors({
    path: '/api/v1/rbac/resources/8b76752b-df18-45bc-af74-1ea9a0db2e40',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
    notFound: 'Permission resource not found',
  })
  @ResponseMessage('Permission resource retrieved successfully')
  getResource(@Param('resourceId') resourceId: string) {
    return this.getResourceUseCase.execute(resourceId);
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
      'Updates the description of an existing permission resource. The resource name stays unchanged.',
  })
  @ApiParam({
    name: 'resourceId',
    description: 'Permission resource identifier.',
    example: '8b76752b-df18-45bc-af74-1ea9a0db2e40',
  })
  @ApiBody({
    type: UpdateResourceDto,
    examples: {
      updateResource: {
        summary: 'Update resource payload',
        value: {
          description: 'Invoice lifecycle management resource.',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Permission resource updated successfully.',
    type: ResourceResponseDto,
  })
  @ApiDefaultErrors({
    path: '/api/v1/rbac/resources/8b76752b-df18-45bc-af74-1ea9a0db2e40',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
    notFound: 'Permission resource not found',
  })
  @ResponseMessage('Permission resource updated successfully')
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
    description: 'Deletes a permission resource by its identifier.',
  })
  @ApiParam({
    name: 'resourceId',
    description: 'Permission resource identifier.',
    example: '8b76752b-df18-45bc-af74-1ea9a0db2e40',
  })
  @ApiOkResponse({
    description: 'Permission resource deletion status.',
    schema: {
      example: {
        success: true,
      },
    },
  })
  @ApiDefaultErrors({
    path: '/api/v1/rbac/resources/8b76752b-df18-45bc-af74-1ea9a0db2e40',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
    notFound: 'Permission resource not found',
  })
  @ResponseMessage('Permission resource deleted successfully')
  deleteResource(@Param('resourceId') resourceId: string) {
    return this.deleteResourceUseCase.execute(resourceId);
  }
}
