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
import { CreateCheckpointEvaluationDto } from './checkpoint-evaluation.dto';
import {
  ApiCheckpointEvaluationsTag,
  ApiCreateCheckpointEvaluation,
  ApiDeleteCheckpointEvaluation,
  ApiGetCheckpointEvaluationById,
  ApiGetEvaluationByCheckpoint,
  ApiListEvaluationsByProbation,
  ApiUpdateCheckpointEvaluation,
  UpdateCheckpointEvaluationDto,
} from './checkpoint-evaluation.docs';
import { CreateCheckpointEvaluationUseCase } from './create-checkpoint-evaluation.usecase';
import { DeleteCheckpointEvaluationUseCase } from './delete-checkpoint-evaluation.usecase';
import {
  GetCheckpointEvaluationByIdUseCase,
  GetEvaluationByCheckpointUseCase,
  ListEvaluationsByProbationUseCase,
} from './query-checkpoint-evaluation.usecase';
import { UpdateCheckpointEvaluationUseCase } from './update-checkpoint-evaluation.usecase';

@ApiCheckpointEvaluationsTag()
@Controller('hr/probation/checkpoint-evaluations')
@UseGuards(KeycloakAuthGuard, RbacGuard)
export class CheckpointEvaluationController {
  constructor(
    private readonly createEvaluation: CreateCheckpointEvaluationUseCase,
    private readonly getById: GetCheckpointEvaluationByIdUseCase,
    private readonly getByCheckpoint: GetEvaluationByCheckpointUseCase,
    private readonly listByProbation: ListEvaluationsByProbationUseCase,
    private readonly updateEvaluation: UpdateCheckpointEvaluationUseCase,
    private readonly deleteEvaluation: DeleteCheckpointEvaluationUseCase,
  ) {}

  @Post()
  @Roles(ProbationPlanPermissions.CREATE)
  @ApiCreateCheckpointEvaluation()
  create(@Body() body: CreateCheckpointEvaluationDto) {
    return this.createEvaluation.execute(body);
  }

  @Get('by-checkpoint/:checkpointId')
  @Roles(ProbationPlanPermissions.VIEW)
  @ApiGetEvaluationByCheckpoint()
  getByCheckpoint(@Param('checkpointId') checkpointId: string) {
    return this.getByCheckpoint.execute(checkpointId);
  }

  @Get('by-probation/:probationId')
  @Roles(ProbationPlanPermissions.VIEW)
  @ApiListEvaluationsByProbation()
  listByProbation(@Param('probationId') probationId: string) {
    return this.listByProbation.execute(probationId);
  }

  @Get(':id')
  @Roles(ProbationPlanPermissions.VIEW)
  @ApiGetCheckpointEvaluationById()
  getById(@Param('id') id: string) {
    return this.getById.execute(id);
  }

  @Patch(':id')
  @Roles(ProbationPlanPermissions.UPDATE)
  @ApiUpdateCheckpointEvaluation()
  update(@Param('id') id: string, @Body() body: UpdateCheckpointEvaluationDto) {
    return this.updateEvaluation.execute(id, body);
  }

  @Delete(':id')
  @Roles(ProbationPlanPermissions.ALL)
  @ApiDeleteCheckpointEvaluation()
  delete(@Param('id') id: string) {
    return this.deleteEvaluation.execute(id);
  }
}
