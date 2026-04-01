import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../../../../shared/decorators/roles.decorator';
import { KeycloakAuthGuard } from '../../../../shared/guards/keycloak-auth.guard';
import { RbacGuard } from '../../../../shared/guards/rbac.guard';
import { ProbationPlanPermissions } from '@repo/types/rbac';
import { CreateFinalEvaluationDto } from './final-evaluation.dto';
import {
  ApiFinalEvaluationsTag,
  ApiCreateFinalEvaluation,
  ApiDeleteFinalEvaluation,
  ApiGetFinalEvaluationById,
  ApiGetFinalEvaluationByProbation,
  ApiUpdateFinalEvaluation,
  UpdateFinalEvaluationDto,
} from './final-evaluation.docs';
import { CreateFinalEvaluationUseCase } from './create-final-evaluation.usecase';
import { DeleteFinalEvaluationUseCase } from './delete-final-evaluation.usecase';
import {
  GetFinalEvaluationByIdUseCase,
  GetFinalEvaluationByProbationUseCase,
} from './query-final-evaluation.usecase';
import { UpdateFinalEvaluationUseCase } from './update-final-evaluation.usecase';

@ApiFinalEvaluationsTag()
@Controller('hr/probation/final-evaluations')
@UseGuards(KeycloakAuthGuard, RbacGuard)
export class FinalEvaluationController {
  constructor(
    private readonly createEvaluation: CreateFinalEvaluationUseCase,
    private readonly getByIdUseCase: GetFinalEvaluationByIdUseCase,
    private readonly getByProbationUseCase: GetFinalEvaluationByProbationUseCase,
    private readonly updateEvaluation: UpdateFinalEvaluationUseCase,
    private readonly deleteEvaluation: DeleteFinalEvaluationUseCase,
  ) {}

  @Post()
  @Roles(ProbationPlanPermissions.ENDORSE)
  @ApiCreateFinalEvaluation()
  create(@Body() body: CreateFinalEvaluationDto) {
    return this.createEvaluation.execute(body);
  }

  @Get('by-probation/:probationId')
  @Roles(ProbationPlanPermissions.VIEW)
  @ApiGetFinalEvaluationByProbation()
  getByProbation(@Param('probationId') probationId: string) {
    return this.getByProbationUseCase.execute(probationId);
  }

  @Get(':id')
  @Roles(ProbationPlanPermissions.VIEW)
  @ApiGetFinalEvaluationById()
  getById(@Param('id') id: string) {
    return this.getByIdUseCase.execute(id);
  }

  @Patch(':id')
  @Roles(ProbationPlanPermissions.ENDORSE)
  @ApiUpdateFinalEvaluation()
  update(@Param('id') id: string, @Body() body: UpdateFinalEvaluationDto) {
    return this.updateEvaluation.execute(id, body);
  }

  @Delete(':id')
  @Roles(ProbationPlanPermissions.ALL)
  @ApiDeleteFinalEvaluation()
  delete(@Param('id') id: string) {
    return this.deleteEvaluation.execute(id);
  }
}
