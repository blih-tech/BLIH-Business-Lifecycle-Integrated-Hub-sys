import { Module } from '@nestjs/common';
import { DataScopeService } from '../../shared/services/data-scope.service';
import { UserPermissionSnapshotService } from './user-permission-snapshot.service';
import { EvaluateAccessUseCase } from './evaluate-access.usecase';
import { EvaluateAccessController } from './evaluate-access.controller';

@Module({
  controllers: [EvaluateAccessController],
  providers: [
    UserPermissionSnapshotService,
    EvaluateAccessUseCase,
    DataScopeService,
  ],
  exports: [
    UserPermissionSnapshotService,
    EvaluateAccessUseCase,
    DataScopeService,
  ],
})
export class RbacSharedModule {}
