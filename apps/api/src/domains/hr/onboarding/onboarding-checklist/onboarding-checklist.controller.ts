import { Body, Controller, Param, Patch, UseGuards } from '@nestjs/common';
import { Roles } from '../../../../shared/decorators/roles.decorator';
import { KeycloakAuthGuard } from '../../../../shared/guards/keycloak-auth.guard';
import { RbacGuard } from '../../../../shared/guards/rbac.guard';
import { OnboardingPermissions } from '@repo/types/rbac';
import { UpdateChecklistStatusDto } from './onboarding-checklist.dto';
import {
  ApiOnboardingChecklistTag,
  ApiUpdateChecklistStatus,
} from './onboarding-checklist.docs';
import { UpdateChecklistStatusUseCase } from './update-checklist-status.usecase';

@ApiOnboardingChecklistTag()
@Controller('hr/onboarding/checklists')
@UseGuards(KeycloakAuthGuard, RbacGuard)
export class OnboardingChecklistController {
  constructor(
    private readonly updateChecklistStatus: UpdateChecklistStatusUseCase,
  ) {}

  @Patch(':id/status')
  @Roles(OnboardingPermissions.UPDATE)
  @ApiUpdateChecklistStatus()
  updateStatus(
    @Param('id') id: string,
    @Body() body: UpdateChecklistStatusDto,
  ) {
    return this.updateChecklistStatus.execute(id, body);
  }
}
