import {
  Body,
  Controller,
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
import { PolicyAcknowledgementPermissions } from '../../../../core/rbac/constants/permissions.constants';
import {
  CreatePolicyAcknowledgementDto,
  PolicyAcknowledgementListQueryDto,
  UpdatePolicyAcknowledgementDto,
} from './policy-acknowledgement.dto';
import {
  ApiCreatePolicyAcknowledgement,
  ApiGetPolicyAcknowledgementById,
  ApiListAllPolicyAcknowledgement,
  ApiListPaginatedPolicyAcknowledgement,
  ApiPolicyAcknowledgementTag,
  ApiUpdatePolicyAcknowledgement,
} from './policy-acknowledgement.docs';
import { CreatePolicyAcknowledgementUseCase } from './create-policy-acknowledgement.usecase';
import {
  GetPolicyAcknowledgementByIdUseCase,
  ListAllPolicyAcknowledgementUseCase,
  ListPaginatedPolicyAcknowledgementUseCase,
} from './query-policy-acknowledgement.usecase';
import { UpdatePolicyAcknowledgementUseCase } from './update-policy-acknowledgement.usecase';

@ApiPolicyAcknowledgementTag()
@Controller('hr/onboarding/policy-acknowledgement')
@UseGuards(KeycloakAuthGuard, RbacGuard)
export class PolicyAcknowledgementController {
  constructor(
    private readonly createAcknowledgement: CreatePolicyAcknowledgementUseCase,
    private readonly listAllAcknowledgements: ListAllPolicyAcknowledgementUseCase,
    private readonly listPaginatedAcknowledgements: ListPaginatedPolicyAcknowledgementUseCase,
    private readonly getAcknowledgementById: GetPolicyAcknowledgementByIdUseCase,
    private readonly updateAcknowledgement: UpdatePolicyAcknowledgementUseCase,
  ) {}

  @Post()
  @Roles(PolicyAcknowledgementPermissions.CREATE)
  @ApiCreatePolicyAcknowledgement()
  create(@Body() body: CreatePolicyAcknowledgementDto) {
    return this.createAcknowledgement.execute(body);
  }

  @Get()
  @Roles(PolicyAcknowledgementPermissions.VIEW)
  @ApiListAllPolicyAcknowledgement()
  listAll(@Query() query: PolicyAcknowledgementListQueryDto) {
    return this.listAllAcknowledgements.execute(query);
  }

  @Get('paginated')
  @Roles(PolicyAcknowledgementPermissions.VIEW)
  @ApiListPaginatedPolicyAcknowledgement()
  listPaginated(
    @Query() query: PolicyAcknowledgementListQueryDto,
    @Req() req: Request,
  ) {
    const requestId =
      (req.headers['x-request-id'] as string | undefined) ?? randomUUID();
    return this.listPaginatedAcknowledgements.execute(query, requestId);
  }

  @Get(':id')
  @Roles(PolicyAcknowledgementPermissions.VIEW)
  @ApiGetPolicyAcknowledgementById()
  getById(@Param('id') id: string) {
    return this.getAcknowledgementById.execute(id);
  }

  @Patch(':id')
  @Roles(PolicyAcknowledgementPermissions.VERIFY)
  @ApiUpdatePolicyAcknowledgement()
  update(
    @Param('id') id: string,
    @Body() body: UpdatePolicyAcknowledgementDto,
  ) {
    return this.updateAcknowledgement.execute(id, body);
  }
}
