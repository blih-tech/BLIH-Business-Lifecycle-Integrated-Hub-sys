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
import { OnboardingPermissions } from '@repo/types/rbac';
import {
  CreateOnboardingDto,
  OnboardingListQueryDto,
  UpdateOnboardingDto,
} from './onboarding.dto';
import {
  ApiCreateOnboarding,
  ApiDeleteOnboarding,
  ApiGetOnboardingById,
  ApiListAllOnboarding,
  ApiListPaginatedOnboarding,
  ApiOnboardingTag,
  ApiUpdateOnboarding,
  ApiCancelOnboarding,
} from './onboarding.docs';
import { CreateOnboardingUseCase } from './create-onboarding.usecase';
import {
  GetOnboardingByIdUseCase,
  ListAllOnboardingUseCase,
  ListPaginatedOnboardingUseCase,
} from './query-onboarding.usecase';
import { UpdateOnboardingUseCase } from './update-onboarding.usecase';
import { DeleteOnboardingUseCase } from './delete-onboarding.usecase';
import { CancelOnboardingUseCase } from './cancel-onboarding.usecase';

@ApiOnboardingTag()
@Controller('hr/onboarding')
@UseGuards(KeycloakAuthGuard, RbacGuard)
export class OnboardingController {
  constructor(
    private readonly createOnboarding: CreateOnboardingUseCase,
    private readonly listAllOnboarding: ListAllOnboardingUseCase,
    private readonly listPaginatedOnboarding: ListPaginatedOnboardingUseCase,
    private readonly getOnboardingById: GetOnboardingByIdUseCase,
    private readonly updateOnboarding: UpdateOnboardingUseCase,
    private readonly deleteOnboarding: DeleteOnboardingUseCase,
    private readonly cancelOnboarding: CancelOnboardingUseCase,
  ) {}

  @Post()
  @Roles(OnboardingPermissions.CREATE)
  @ApiCreateOnboarding()
  create(@Body() body: CreateOnboardingDto) {
    return this.createOnboarding.execute(body);
  }

  @Get()
  @Roles(OnboardingPermissions.VIEW)
  @ApiListAllOnboarding()
  listAll(@Query() query: OnboardingListQueryDto) {
    return this.listAllOnboarding.execute(query);
  }

  @Get('paginated')
  @Roles(OnboardingPermissions.VIEW)
  @ApiListPaginatedOnboarding()
  listPaginated(@Query() query: OnboardingListQueryDto, @Req() req: Request) {
    const requestId =
      (req.headers['x-request-id'] as string | undefined) ?? randomUUID();
    return this.listPaginatedOnboarding.execute(query, requestId);
  }

  @Get(':id')
  @Roles(OnboardingPermissions.VIEW)
  @ApiGetOnboardingById()
  getById(@Param('id') id: string) {
    return this.getOnboardingById.execute(id);
  }

  @Patch(':id')
  @Roles(OnboardingPermissions.UPDATE)
  @ApiUpdateOnboarding()
  update(@Param('id') id: string, @Body() body: UpdateOnboardingDto) {
    return this.updateOnboarding.execute(id, body);
  }

  @Post(':id/cancel')
  @Roles(OnboardingPermissions.UPDATE)
  @ApiCancelOnboarding()
  cancel(@Param('id') id: string) {
    return this.cancelOnboarding.execute(id);
  }

  @Delete(':id')
  @Roles(OnboardingPermissions.DELETE)
  @ApiDeleteOnboarding()
  delete(@Param('id') id: string) {
    return this.deleteOnboarding.execute(id);
  }
}
