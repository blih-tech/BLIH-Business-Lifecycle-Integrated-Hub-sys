import {
  Body,
  Controller,
  Delete,
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
import { Roles } from '../../../shared/decorators/roles.decorator';
import { KeycloakAuthGuard } from '../../../shared/guards/keycloak-auth.guard';
import { RbacGuard } from '../../../shared/guards/rbac.guard';
import { ProbationPlanPermissions } from '@repo/types/rbac';
import {
  CreateProbationDto,
  ProbationListQueryDto,
  UpdateProbationDto,
} from './probation.dto';
import {
  ApiCreateProbation,
  ApiDeleteProbation,
  ApiGetProbationById,
  ApiListAllProbation,
  ApiListPaginatedProbation,
  ApiProbationTag,
  ApiUpdateProbation,
} from './probation.docs';
import { CreateProbationUseCase } from './create-probation.usecase';
import { DeleteProbationUseCase } from './delete-probation.usecase';
import {
  GetProbationByIdUseCase,
  ListAllProbationUseCase,
  ListPaginatedProbationUseCase,
} from './query-probation.usecase';
import { UpdateProbationUseCase } from './update-probation.usecase';

@ApiProbationTag()
@Controller('hr/probation')
@UseGuards(KeycloakAuthGuard, RbacGuard)
export class ProbationController {
  constructor(
    private readonly createProbation: CreateProbationUseCase,
    private readonly listAllProbation: ListAllProbationUseCase,
    private readonly listPaginatedProbation: ListPaginatedProbationUseCase,
    private readonly getProbationById: GetProbationByIdUseCase,
    private readonly updateProbation: UpdateProbationUseCase,
    private readonly deleteProbation: DeleteProbationUseCase,
  ) {}

  @Post()
  @Roles(ProbationPlanPermissions.CREATE)
  @ApiCreateProbation()
  create(@Body() body: CreateProbationDto) {
    return this.createProbation.execute(body);
  }

  @Get()
  @Roles(ProbationPlanPermissions.VIEW)
  @ApiListAllProbation()
  listAll(@Query() query: ProbationListQueryDto) {
    return this.listAllProbation.execute(query);
  }

  @Get('paginated')
  @Roles(ProbationPlanPermissions.VIEW)
  @ApiListPaginatedProbation()
  listPaginated(@Query() query: ProbationListQueryDto, @Req() req: Request) {
    const requestId =
      (req.headers['x-request-id'] as string | undefined) ?? randomUUID();
    return this.listPaginatedProbation.execute(query, requestId);
  }

  @Get(':id')
  @Roles(ProbationPlanPermissions.VIEW)
  @ApiGetProbationById()
  getById(@Param('id') id: string) {
    return this.getProbationById.execute(id);
  }

  @Patch(':id')
  @Roles(ProbationPlanPermissions.UPDATE)
  @ApiUpdateProbation()
  update(@Param('id') id: string, @Body() body: UpdateProbationDto) {
    return this.updateProbation.execute(id, body);
  }

  @Delete(':id')
  @Roles(ProbationPlanPermissions.ALL)
  @ApiDeleteProbation()
  delete(@Param('id') id: string) {
    return this.deleteProbation.execute(id);
  }
}
