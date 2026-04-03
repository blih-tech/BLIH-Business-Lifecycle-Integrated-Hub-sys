import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { KeycloakAuthGuard } from '../../../../shared/guards/keycloak-auth.guard';
import { RbacGuard } from '../../../../shared/guards/rbac.guard';
import {
  ContractTypeListQueryDto,
  CreateContractTypeDto,
  UpdateContractTypeDto,
} from './contract-type.dto';
import {
  ApiContractTypeTag,
  ApiCreateContractType,
  ApiDeleteContractType,
  ApiGetContractTypeById,
  ApiListAllContractTypes,
  ApiListPaginatedContractTypes,
  ApiUpdateContractType,
} from './contract-type.docs';
import { CreateContractTypeUseCase } from './create-contract-type.usecase';
import { UpdateContractTypeUseCase } from './update-contract-type.usecase';
import {
  GetContractTypeByIdUseCase,
  ListAllContractTypesUseCase,
  ListPaginatedContractTypesUseCase,
} from './query-contract-type.usecase';
import { DeleteContractTypeUseCase } from './delete-contract-type.usecase';

@ApiContractTypeTag()
@Controller('hr/contracts/types')
@UseGuards(KeycloakAuthGuard, RbacGuard)
export class ContractTypeController {
  constructor(
    private readonly createContractType: CreateContractTypeUseCase,
    private readonly updateContractType: UpdateContractTypeUseCase,
    private readonly listAllContractTypes: ListAllContractTypesUseCase,
    private readonly listPaginatedContractTypes: ListPaginatedContractTypesUseCase,
    private readonly getContractTypeById: GetContractTypeByIdUseCase,
    private readonly deleteContractType: DeleteContractTypeUseCase,
  ) {}

  @Post()
  @ApiCreateContractType()
  create(@Body() body: CreateContractTypeDto) {
    return this.createContractType.execute(body);
  }

  @Get()
  @ApiListAllContractTypes()
  listAll() {
    return this.listAllContractTypes.execute();
  }

  @Get('paginated')
  @ApiListPaginatedContractTypes()
  listPaginated(@Query() query: ContractTypeListQueryDto) {
    // Controller can handle the request ID extraction for response envelope if needed.
    // Usually the interceptor handles pagination envelopes now.
    return this.listPaginatedContractTypes.execute(query);
  }

  @Get(':id')
  @ApiGetContractTypeById()
  getById(@Param('id') id: string) {
    return this.getContractTypeById.execute(id);
  }

  @Patch(':id')
  @ApiUpdateContractType()
  update(@Param('id') id: string, @Body() body: UpdateContractTypeDto) {
    return this.updateContractType.execute(id, body);
  }

  @Delete(':id')
  @ApiDeleteContractType()
  async delete(@Param('id') id: string) {
    await this.deleteContractType.execute(id);
    return { success: true };
  }
}
