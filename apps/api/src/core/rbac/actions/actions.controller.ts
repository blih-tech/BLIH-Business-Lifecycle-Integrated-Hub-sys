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
import { Roles } from '../../../shared/decorators/roles.decorator';
import { ResponseMessage } from '../../../shared/decorators/response-message.decorator';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ApiDefaultErrors, ApiProtected } from '../../../shared/docs/openapi';
import { KeycloakAuthGuard } from '../../../shared/guards/keycloak-auth.guard';
import { RbacGuard } from '../../../shared/guards/rbac.guard';
import { SystemPermissionPermissions } from '@repo/types/rbac';
import { ActionResponseDto } from './dto/action-response.dto';
import { CreateActionDto } from './dto/create-action.dto';
import { UpdateActionDto } from './dto/update-action.dto';
import { CreateActionUseCase } from './usecases/create-action.usecase';
import { DeleteActionUseCase } from './usecases/delete-action.usecase';
import { GetActionUseCase } from './usecases/get-action.usecase';
import { ListActionsUseCase } from './usecases/list-actions.usecase';
import { UpdateActionUseCase } from './usecases/update-action.usecase';

@ApiTags('RBAC')
@Controller('rbac')
@UseGuards(KeycloakAuthGuard, RbacGuard)
export class ActionsController {
  constructor(
    private readonly listActionsUseCase: ListActionsUseCase,
    private readonly getActionUseCase: GetActionUseCase,
    private readonly createActionUseCase: CreateActionUseCase,
    private readonly updateActionUseCase: UpdateActionUseCase,
    private readonly deleteActionUseCase: DeleteActionUseCase,
  ) {}

  @Post('actions')
  @Roles(SystemPermissionPermissions.CREATE)
  @ApiProtected({
    path: '/api/v1/rbac/actions',
    roles: [SystemPermissionPermissions.CREATE],
  })
  @ApiOperation({
    summary: 'Create action',
    description:
      'Creates a permission action entry that can be paired with a resource to build permission slugs.',
  })
  @ApiBody({
    type: CreateActionDto,
    examples: {
      createAction: {
        summary: 'Create action payload',
        value: {
          name: 'approve',
          description: 'Approves an operation on a protected resource.',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Permission action created successfully.',
    type: ActionResponseDto,
  })
  @ApiDefaultErrors({
    path: '/api/v1/rbac/actions',
    badRequest: 'Action name already exists',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  @ResponseMessage('Permission action created successfully')
  createAction(@Body() dto: CreateActionDto) {
    return this.createActionUseCase.execute(dto);
  }

  @Get('actions')
  @Roles(SystemPermissionPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/rbac/actions',
    roles: [SystemPermissionPermissions.VIEW],
  })
  @ApiOperation({
    summary: 'List actions',
    description:
      'Returns permission actions sorted alphabetically by action name.',
  })
  @ApiOkResponse({
    description: 'Permission actions sorted by name.',
    type: ActionResponseDto,
    isArray: true,
  })
  @ApiDefaultErrors({
    path: '/api/v1/rbac/actions',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  @ResponseMessage('Permission actions retrieved successfully')
  listActions() {
    return this.listActionsUseCase.execute();
  }

  @Get('actions/:actionId')
  @Roles(SystemPermissionPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/rbac/actions/:actionId',
    roles: [SystemPermissionPermissions.VIEW],
  })
  @ApiOperation({
    summary: 'Get action',
    description: 'Returns a single permission action by its identifier.',
  })
  @ApiParam({
    name: 'actionId',
    description: 'Action id.',
    example: '65a7eb9a-8803-4f20-b649-0886c4dceef8',
  })
  @ApiOkResponse({
    description: 'Permission action details.',
    type: ActionResponseDto,
  })
  @ApiDefaultErrors({
    path: '/api/v1/rbac/actions/65a7eb9a-8803-4f20-b649-0886c4dceef8',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
    notFound: 'Permission action not found',
  })
  @ResponseMessage('Permission action retrieved successfully')
  getAction(@Param('actionId') actionId: string) {
    return this.getActionUseCase.execute(actionId);
  }

  @Put('actions/:actionId')
  @Roles(SystemPermissionPermissions.UPDATE)
  @ApiProtected({
    path: '/api/v1/rbac/actions/:actionId',
    roles: [SystemPermissionPermissions.UPDATE],
  })
  @ApiOperation({
    summary: 'Update action',
    description:
      'Updates the description of an existing permission action. The action name stays unchanged.',
  })
  @ApiParam({
    name: 'actionId',
    description: 'Permission action identifier.',
    example: '65a7eb9a-8803-4f20-b649-0886c4dceef8',
  })
  @ApiBody({
    type: UpdateActionDto,
    examples: {
      updateAction: {
        summary: 'Update action payload',
        value: {
          description: 'Approves an operation after policy evaluation.',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Permission action updated successfully.',
    type: ActionResponseDto,
  })
  @ApiDefaultErrors({
    path: '/api/v1/rbac/actions/65a7eb9a-8803-4f20-b649-0886c4dceef8',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
    notFound: 'Permission action not found',
  })
  @ResponseMessage('Permission action updated successfully')
  updateAction(
    @Param('actionId') actionId: string,
    @Body() dto: UpdateActionDto,
  ) {
    return this.updateActionUseCase.execute(actionId, dto);
  }

  @Delete('actions/:actionId')
  @Roles(SystemPermissionPermissions.DELETE)
  @ApiProtected({
    path: '/api/v1/rbac/actions/:actionId',
    roles: [SystemPermissionPermissions.DELETE],
  })
  @ApiOperation({
    summary: 'Delete action',
    description: 'Deletes a permission action by its identifier.',
  })
  @ApiParam({
    name: 'actionId',
    description: 'Permission action identifier.',
    example: '65a7eb9a-8803-4f20-b649-0886c4dceef8',
  })
  @ApiOkResponse({
    description: 'Permission action deletion status.',
    schema: {
      example: {
        success: true,
      },
    },
  })
  @ApiDefaultErrors({
    path: '/api/v1/rbac/actions/65a7eb9a-8803-4f20-b649-0886c4dceef8',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
    notFound: 'Permission action not found',
  })
  @ResponseMessage('Permission action deleted successfully')
  deleteAction(@Param('actionId') actionId: string) {
    return this.deleteActionUseCase.execute(actionId);
  }
}
