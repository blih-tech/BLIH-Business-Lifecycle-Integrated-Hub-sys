import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ApiProtected } from '../../../shared/docs/openapi';
import { KeycloakAuthGuard } from '../../../shared/guards/keycloak-auth.guard';
import { RbacGuard } from '../../../shared/guards/rbac.guard';
import {
  EmployeePermissions,
  UserProfilePermissions,
} from '../../../core/rbac/constants/permissions.constants';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { ListEmployeeContractsUseCase } from './use-cases/list-employee-contracts.usecase';
import { CreateContractUseCase } from './use-cases/create-contract.usecase';
import { UpdateContractUseCase } from './use-cases/update-contract.usecase';

@ApiTags('HR Employee Contracts')
@Controller('hr/employees/:userId/contracts')
@UseGuards(KeycloakAuthGuard, RbacGuard)
export class EmployeeContractsController {
  constructor(
    private readonly listEmployeeContractsUseCase: ListEmployeeContractsUseCase,
    private readonly createContractUseCase: CreateContractUseCase,
    private readonly updateContractUseCase: UpdateContractUseCase,
  ) {}

  @Get()
  @Roles(EmployeePermissions.VIEW, UserProfilePermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/employees/:userId/contracts',
    roles: [EmployeePermissions.VIEW, UserProfilePermissions.VIEW],
  })
  @ApiOperation({ summary: 'List employee contracts' })
  @ApiParam({ name: 'userId' })
  @ApiOkResponse({ description: 'List of contracts' })
  list(@Param('userId') userId: string) {
    return this.listEmployeeContractsUseCase.execute(userId);
  }

  @Post()
  @Roles(EmployeePermissions.UPDATE)
  @ApiProtected({
    path: '/api/v1/hr/employees/:userId/contracts',
    roles: [EmployeePermissions.UPDATE],
  })
  @ApiOperation({ summary: 'Create contract' })
  @ApiParam({ name: 'userId' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['contractType', 'sequenceNumber', 'startDate'],
    },
  })
  @ApiOkResponse({ description: 'Created contract' })
  create(
    @Param('userId') userId: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.createContractUseCase.execute(userId, body as never);
  }

  @Patch(':contractId')
  @Roles(EmployeePermissions.UPDATE)
  @ApiProtected({
    path: '/api/v1/hr/employees/:userId/contracts/:contractId',
    roles: [EmployeePermissions.UPDATE],
  })
  @ApiOperation({ summary: 'Update contract' })
  @ApiParam({ name: 'userId' })
  @ApiParam({ name: 'contractId' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiOkResponse({ description: 'Updated contract' })
  update(
    @Param('userId') userId: string,
    @Param('contractId') contractId: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.updateContractUseCase.execute(
      userId,
      contractId,
      body as never,
    );
  }
}
