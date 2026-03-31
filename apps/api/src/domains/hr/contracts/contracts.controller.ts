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
import { KeycloakAuthGuard } from '../../../shared/guards/keycloak-auth.guard';
import { RbacGuard } from '../../../shared/guards/rbac.guard';
import {
  ContractListQueryDto,
  CreateContractDto,
  UpdateContractDto,
} from './contracts.dto';
import {
  ApiContractsTag,
  ApiCreateContract,
  ApiDeleteContract,
  ApiGetContractById,
  ApiListAllContracts,
  ApiListPaginatedContracts,
  ApiSignContract,
  ApiUpdateContract,
} from './contracts.docs';
import { CreateContractUseCase } from './create-contract.usecase';
import { UpdateContractUseCase } from './update-contract.usecase';
import {
  GetContractByIdUseCase,
  ListAllContractsUseCase,
  ListPaginatedContractsUseCase,
} from './query-contract.usecase';
import { DeleteContractUseCase } from './delete-contract.usecase';
import { SignContractUseCase } from './sign-contract.usecase';

@ApiContractsTag()
@Controller('hr/contracts')
@UseGuards(KeycloakAuthGuard, RbacGuard)
export class ContractsController {
  constructor(
    private readonly createContract: CreateContractUseCase,
    private readonly updateContract: UpdateContractUseCase,
    private readonly listAllContracts: ListAllContractsUseCase,
    private readonly listPaginatedContracts: ListPaginatedContractsUseCase,
    private readonly getContractById: GetContractByIdUseCase,
    private readonly deleteContract: DeleteContractUseCase,
    private readonly signContract: SignContractUseCase,
  ) {}

  @Post()
  @ApiCreateContract()
  create(@Body() body: CreateContractDto) {
    return this.createContract.execute(body);
  }

  @Get()
  @ApiListAllContracts()
  listAll() {
    return this.listAllContracts.execute();
  }

  @Get('paginated')
  @ApiListPaginatedContracts()
  listPaginated(@Query() query: ContractListQueryDto) {
    return this.listPaginatedContracts.execute(query);
  }

  @Get(':id')
  @ApiGetContractById()
  getById(@Param('id') id: string) {
    return this.getContractById.execute(id);
  }

  @Patch(':id')
  @ApiUpdateContract()
  update(@Param('id') id: string, @Body() body: UpdateContractDto) {
    return this.updateContract.execute(id, body);
  }

  @Delete(':id')
  @ApiDeleteContract()
  async delete(@Param('id') id: string) {
    await this.deleteContract.execute(id);
    return { success: true };
  }

  @Patch(':id/sign')
  @ApiSignContract()
  sign(@Param('id') id: string, @Req() req: any) {
    // Extract userId from authenticated request
    const userId = req.user?.sub;
    return this.signContract.execute(id, userId);
  }
}
