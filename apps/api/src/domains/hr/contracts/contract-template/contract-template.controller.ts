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
import { KeycloakAuthGuard } from '../../../../shared/guards/keycloak-auth.guard';
import { RbacGuard } from '../../../../shared/guards/rbac.guard';
import {
  ContractTemplateListQueryDto,
  CreateContractTemplateDto,
  UpdateContractTemplateDto,
} from './contract-template.dto';
import {
  ApiContractTemplateTag,
  ApiCreateContractTemplate,
  ApiDeleteContractTemplate,
  ApiGetContractTemplateById,
  ApiListAllContractTemplates,
  ApiListPaginatedContractTemplates,
  ApiUpdateContractTemplate,
} from './contract-template.docs';
import { CreateContractTemplateUseCase } from './create-contract-template.usecase';
import { UpdateContractTemplateUseCase } from './update-contract-template.usecase';
import {
  GetContractTemplateByIdUseCase,
  ListAllContractTemplatesUseCase,
  ListPaginatedContractTemplatesUseCase,
} from './query-contract-template.usecase';
import { DeleteContractTemplateUseCase } from './delete-contract-template.usecase';

@ApiContractTemplateTag()
@Controller('hr/contracts/templates')
@UseGuards(KeycloakAuthGuard, RbacGuard)
export class ContractTemplateController {
  constructor(
    private readonly createContractTemplate: CreateContractTemplateUseCase,
    private readonly updateContractTemplate: UpdateContractTemplateUseCase,
    private readonly listAllContractTemplates: ListAllContractTemplatesUseCase,
    private readonly listPaginatedContractTemplates: ListPaginatedContractTemplatesUseCase,
    private readonly getContractTemplateById: GetContractTemplateByIdUseCase,
    private readonly deleteContractTemplate: DeleteContractTemplateUseCase,
  ) {}

  @Post()
  @ApiCreateContractTemplate()
  create(@Body() body: CreateContractTemplateDto) {
    return this.createContractTemplate.execute(body);
  }

  @Get()
  @ApiListAllContractTemplates()
  listAll() {
    return this.listAllContractTemplates.execute();
  }

  @Get('paginated')
  @ApiListPaginatedContractTemplates()
  listPaginated(@Query() query: ContractTemplateListQueryDto) {
    return this.listPaginatedContractTemplates.execute(query);
  }

  @Get(':id')
  @ApiGetContractTemplateById()
  getById(@Param('id') id: string) {
    return this.getContractTemplateById.execute(id);
  }

  @Patch(':id')
  @ApiUpdateContractTemplate()
  update(@Param('id') id: string, @Body() body: UpdateContractTemplateDto) {
    return this.updateContractTemplate.execute(id, body);
  }

  @Delete(':id')
  @ApiDeleteContractTemplate()
  async delete(@Param('id') id: string) {
    await this.deleteContractTemplate.execute(id);
    return { success: true };
  }
}
