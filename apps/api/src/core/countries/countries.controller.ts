import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DepartmentPermissions } from '@repo/types/rbac';
import { Roles } from '../../shared/decorators/roles.decorator';
import { ResponseMessage } from '../../shared/decorators/response-message.decorator';
import { ApiDefaultErrors, ApiProtected } from '../../shared/docs/openapi';
import { KeycloakAuthGuard } from '../../shared/guards/keycloak-auth.guard';
import { RbacGuard } from '../../shared/guards/rbac.guard';
import { PrismaService } from '../../platform/prisma/prisma.service';

@ApiTags('Countries')
@Controller('countries')
@UseGuards(KeycloakAuthGuard, RbacGuard)
export class CountriesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @Roles(DepartmentPermissions.VIEW)
  @ApiProtected({ path: '/api/v1/countries' })
  @ApiOperation({
    summary: 'List countries',
    description: 'Returns active country reference data sorted by name.',
  })
  @ApiOkResponse({
    description: 'Country list.',
    schema: {
      example: [{ id: 'uuid', name: 'Ethiopia', code: 'ETH' }],
    },
  })
  @ApiDefaultErrors({
    path: '/api/v1/countries',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  @ResponseMessage('Countries retrieved successfully')
  listCountries() {
    return this.prisma.countryReference.findMany({
      where: { isActive: true },
      select: { id: true, name: true, code: true },
      orderBy: { name: 'asc' },
    });
  }
}
