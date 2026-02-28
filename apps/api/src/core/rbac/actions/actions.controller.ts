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
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ApiDefaultErrors, ApiProtected } from '../../../shared/docs/openapi';
import { KeycloakAuthGuard } from '../../../shared/guards/keycloak-auth.guard';
import { RbacGuard } from '../../../shared/guards/rbac.guard';
import { SystemPermissionPermissions } from '../constants/permissions.constants';
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
    description: 'Lists seeded RBAC permission actions.',
  })
  @ApiOkResponse({
    description: 'Permission actions.',
  })
  @ApiDefaultErrors({
    path: '/api/v1/rbac/actions',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
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
    description: 'Returns a single seeded RBAC action by id.',
  })
  @ApiParam({
    name: 'actionId',
    description: 'Action id.',
    example: '65a7eb9a-8803-4f20-b649-0886c4dceef8',
  })
  @ApiOkResponse({
    description: 'Permission action.',
  })
  @ApiDefaultErrors({
    path: '/api/v1/rbac/actions/65a7eb9a-8803-4f20-b649-0886c4dceef8',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
    notFound: 'Permission action not found',
  })
  getAction(@Param('actionId') actionId: string) {
    return this.getActionUseCase.execute(actionId);
  }

  @Put('actions/:actionId')
  @Roles(SystemPermissionPermissions.UPDATE)
  updateAction(
    @Param('actionId') actionId: string,
    @Body() dto: UpdateActionDto,
  ) {
    return this.updateActionUseCase.execute(actionId, dto);
  }

  @Delete('actions/:actionId')
  @Roles(SystemPermissionPermissions.DELETE)
  deleteAction(@Param('actionId') actionId: string) {
    return this.deleteActionUseCase.execute(actionId);
  }
}
