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
import { Roles } from '../../../../shared/decorators/roles.decorator';
import { KeycloakAuthGuard } from '../../../../shared/guards/keycloak-auth.guard';
import { RbacGuard } from '../../../../shared/guards/rbac.guard';
import { ProbationKpiPermissions } from '@repo/types/rbac';
import {
  CreateKpiDto,
  KpiListQueryDto,
  UpdateKpiDto,
} from './probation-kpi.dto';
import {
  ApiCreateKpi,
  ApiDeleteKpi,
  ApiGetKpiById,
  ApiListAllKpis,
  ApiListPaginatedKpis,
  ApiProbationKpisTag,
  ApiUpdateKpi,
} from './probation-kpi.docs';
import { CreateKpiUseCase } from './create-probation-kpi.usecase';
import { DeleteKpiUseCase } from './delete-probation-kpi.usecase';
import {
  GetKpiByIdUseCase,
  ListAllKpisUseCase,
  ListPaginatedKpisUseCase,
} from './query-probation-kpi.usecase';
import { UpdateKpiUseCase } from './update-probation-kpi.usecase';

@ApiProbationKpisTag()
@Controller('hr/probation/kpis')
@UseGuards(KeycloakAuthGuard, RbacGuard)
export class ProbationKpiController {
  constructor(
    private readonly createKpi: CreateKpiUseCase,
    private readonly listAllKpis: ListAllKpisUseCase,
    private readonly listPaginatedKpis: ListPaginatedKpisUseCase,
    private readonly getKpiById: GetKpiByIdUseCase,
    private readonly updateKpi: UpdateKpiUseCase,
    private readonly deleteKpi: DeleteKpiUseCase,
  ) {}

  @Post()
  @Roles(ProbationKpiPermissions.CREATE)
  @ApiCreateKpi()
  create(@Body() body: CreateKpiDto) {
    return this.createKpi.execute(body);
  }

  @Get()
  @Roles(ProbationKpiPermissions.VIEW)
  @ApiListAllKpis()
  listAll(@Query() query: KpiListQueryDto) {
    return this.listAllKpis.execute(query);
  }

  @Get('paginated')
  @Roles(ProbationKpiPermissions.VIEW)
  @ApiListPaginatedKpis()
  listPaginated(@Query() query: KpiListQueryDto, @Req() req: Request) {
    const requestId =
      (req.headers['x-request-id'] as string | undefined) ?? randomUUID();
    return this.listPaginatedKpis.execute(query, requestId);
  }

  @Get(':id')
  @Roles(ProbationKpiPermissions.VIEW)
  @ApiGetKpiById()
  getById(@Param('id') id: string) {
    return this.getKpiById.execute(id);
  }

  @Patch(':id')
  @Roles(ProbationKpiPermissions.UPDATE)
  @ApiUpdateKpi()
  update(@Param('id') id: string, @Body() body: UpdateKpiDto) {
    return this.updateKpi.execute(id, body);
  }

  @Delete(':id')
  @Roles(ProbationKpiPermissions.DELETE)
  @ApiDeleteKpi()
  delete(@Param('id') id: string) {
    return this.deleteKpi.execute(id);
  }
}
