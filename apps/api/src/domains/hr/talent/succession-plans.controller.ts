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
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import type {
  CreateSuccessionPlanDto,
  UpdateSuccessionPlanDto,
} from '@repo/types';
import { SuccessionPlanPermissions } from '../../../core/rbac/constants/permissions.constants';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { ApiProtected } from '../../../shared/docs/openapi';
import { KeycloakAuthGuard } from '../../../shared/guards/keycloak-auth.guard';
import { RbacGuard } from '../../../shared/guards/rbac.guard';
import { CreateSuccessionPlanUseCase } from './use-cases/create-succession-plan.usecase';
import { ListSuccessionPlansUseCase } from './use-cases/list-succession-plans.usecase';
import { UpdateSuccessionPlanUseCase } from './use-cases/update-succession-plan.usecase';

@ApiTags('HR Talent')
@Controller('hr/succession-plans')
@UseGuards(KeycloakAuthGuard, RbacGuard)
export class SuccessionPlansController {
  constructor(
    private readonly createUseCase: CreateSuccessionPlanUseCase,
    private readonly listUseCase: ListSuccessionPlansUseCase,
    private readonly updateUseCase: UpdateSuccessionPlanUseCase,
  ) {}

  @Get()
  @Roles(SuccessionPlanPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/succession-plans',
    roles: [SuccessionPlanPermissions.VIEW],
  })
  @ApiOperation({ summary: 'List succession plans' })
  @ApiOkResponse({ description: 'Succession plan list' })
  list(
    @Query('positionId') positionId?: string,
    @Query('candidateId') candidateId?: string,
  ) {
    return this.listUseCase.execute({ positionId, candidateId });
  }

  @Post()
  @Roles(SuccessionPlanPermissions.CREATE)
  @ApiProtected({
    path: '/api/v1/hr/succession-plans',
    roles: [SuccessionPlanPermissions.CREATE],
  })
  @ApiOperation({ summary: 'Create succession plan entry' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiOkResponse({ description: 'Created succession plan' })
  create(@Body() body: CreateSuccessionPlanDto) {
    return this.createUseCase.execute(body);
  }

  @Patch(':id')
  @Roles(SuccessionPlanPermissions.UPDATE)
  @ApiProtected({
    path: '/api/v1/hr/succession-plans/:id',
    roles: [SuccessionPlanPermissions.UPDATE],
  })
  @ApiOperation({ summary: 'Update succession plan entry' })
  @ApiParam({ name: 'id' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiOkResponse({ description: 'Updated succession plan' })
  update(@Param('id') id: string, @Body() body: UpdateSuccessionPlanDto) {
    return this.updateUseCase.execute(id, body);
  }
}
