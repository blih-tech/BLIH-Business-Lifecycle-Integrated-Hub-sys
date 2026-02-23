import { Module } from '@nestjs/common';
import { SystemConfigController } from './system-config.controller';
import { ListSystemConfigUseCase } from './use-cases/list-system-config.usecase';
import { UpdateModuleConfigUseCase } from './use-cases/update-module-config.usecase';
import { UpdateSecurityPolicyUseCase } from './use-cases/update-security-policy.usecase';
import { UpdateSystemConfigUseCase } from './use-cases/update-system-config.usecase';

@Module({
  controllers: [SystemConfigController],
  providers: [
    UpdateSystemConfigUseCase,
    UpdateModuleConfigUseCase,
    UpdateSecurityPolicyUseCase,
    ListSystemConfigUseCase,
  ],
})
export class SystemConfigModule {}
