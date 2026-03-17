import { Module } from '@nestjs/common';
import { UserPermissionSnapshotService } from './user-permission-snapshot.service';
import { EvaluateAccessUseCase } from './evaluate-access.usecase';
import { EvaluateAccessController } from './evaluate-access.controller';

@Module({
  controllers: [EvaluateAccessController],
  providers: [UserPermissionSnapshotService, EvaluateAccessUseCase],
  exports: [UserPermissionSnapshotService, EvaluateAccessUseCase],
})
export class RbacSharedModule {}
