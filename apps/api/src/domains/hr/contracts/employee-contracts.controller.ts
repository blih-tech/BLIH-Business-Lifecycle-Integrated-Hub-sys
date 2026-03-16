import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import {
  ApiDefaultErrors,
  ApiEnvelopeArrayResponse,
  ApiEnvelopeOkResponse,
  ApiProtected,
  GenericEntityResponseDto,
} from '../../../shared/docs/openapi';
import { KeycloakAuthGuard } from '../../../shared/guards/keycloak-auth.guard';
import { RbacGuard } from '../../../shared/guards/rbac.guard';
import { EmployeePermissions, UserProfilePermissions } from '@repo/types/rbac';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { ListEmployeeContractsUseCase } from './use-cases/list-employee-contracts.usecase';
import { CreateContractUseCase } from './use-cases/create-contract.usecase';
import { UpdateContractUseCase } from './use-cases/update-contract.usecase';

@ApiTags('HR Employee Contracts')
@Controller('hr/employees/:employeeId/contracts')
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
    path: '/api/v1/hr/employees/:employeeId/contracts',
    roles: [EmployeePermissions.VIEW, UserProfilePermissions.VIEW],
  })
  @ApiOperation({ summary: 'List employee contracts' })
  @ApiParam({ name: 'employeeId' })
  @ApiEnvelopeArrayResponse(GenericEntityResponseDto, 'List of contracts')
  @ApiDefaultErrors({
    path: '/api/v1/hr/employees/:employeeId/contracts',
    notFound: 'Employee contracts not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  list(@Param('employeeId') employeeId: string) {
    return this.listEmployeeContractsUseCase.execute(employeeId);
  }

  @Post()
  @Roles(EmployeePermissions.UPDATE)
  @ApiProtected({
    path: '/api/v1/hr/employees/:employeeId/contracts',
    roles: [EmployeePermissions.UPDATE],
  })
  @ApiOperation({ summary: 'Create contract' })
  @ApiParam({ name: 'employeeId' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['contractType', 'sequenceNumber', 'startDate'],
    },
  })
  @ApiEnvelopeOkResponse(GenericEntityResponseDto, 'Created contract')
  @ApiDefaultErrors({
    path: '/api/v1/hr/employees/:employeeId/contracts',
    badRequest: 'Contract payload is invalid',
    notFound: 'Employee not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  create(
    @Param('employeeId') employeeId: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.createContractUseCase.execute(employeeId, body as never);
  }

  @Patch(':contractId')
  @Roles(EmployeePermissions.UPDATE)
  @ApiProtected({
    path: '/api/v1/hr/employees/:employeeId/contracts/:contractId',
    roles: [EmployeePermissions.UPDATE],
  })
  @ApiOperation({ summary: 'Update contract' })
  @ApiParam({ name: 'employeeId' })
  @ApiParam({ name: 'contractId' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiEnvelopeOkResponse(GenericEntityResponseDto, 'Updated contract')
  @ApiDefaultErrors({
    path: '/api/v1/hr/employees/:employeeId/contracts/:contractId',
    badRequest: 'Contract payload is invalid',
    notFound: 'Employee contract not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  update(
    @Param('employeeId') employeeId: string,
    @Param('contractId') contractId: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.updateContractUseCase.execute(
      employeeId,
      contractId,
      body as never,
    );
  }
}
