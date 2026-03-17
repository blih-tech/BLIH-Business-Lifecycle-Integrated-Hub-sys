import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Audit } from '../../shared/decorators/audit.decorator';
import { AuditState } from '../../shared/decorators/audit-state.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';
import { ResponseMessage } from '../../shared/decorators/response-message.decorator';
import { ApiDefaultErrors, ApiProtected } from '../../shared/docs/openapi';
import { KeycloakAuthGuard } from '../../shared/guards/keycloak-auth.guard';
import { RbacGuard } from '../../shared/guards/rbac.guard';
import { PositionPermissions } from '../rbac/constants/permissions.constants';
import { CreatePositionDto } from './dto/create-position.dto';
import { ListPositionsQueryDto } from './dto/list-positions-query.dto';
import { PositionResponseDto } from './dto/position-response.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { CreatePositionUseCase } from './use-cases/create-position.usecase';
import { DeletePositionUseCase } from './use-cases/delete-position.usecase';
import { GetPositionUseCase } from './use-cases/get-position.usecase';
import { ListPositionsUseCase } from './use-cases/list-positions.usecase';
import { UpdatePositionUseCase } from './use-cases/update-position.usecase';

@ApiTags('Positions')
@Controller('positions')
@UseGuards(KeycloakAuthGuard, RbacGuard)
export class PositionsController {
  constructor(
    private readonly createPositionUseCase: CreatePositionUseCase,
    private readonly listPositionsUseCase: ListPositionsUseCase,
    private readonly getPositionUseCase: GetPositionUseCase,
    private readonly updatePositionUseCase: UpdatePositionUseCase,
    private readonly deletePositionUseCase: DeletePositionUseCase,
  ) {}

  @Post()
  @Roles(PositionPermissions.CREATE)
  @Audit('position.create', 'system.position')
  @ApiProtected({
    path: '/api/v1/positions',
    roles: [PositionPermissions.CREATE],
  })
  @ApiOperation({
    summary: 'Create position',
    description:
      'Creates a position catalog entry that can be assigned to a department and reused across HR workflows.',
  })
  @ApiBody({
    type: CreatePositionDto,
    examples: {
      createPosition: {
        summary: 'Create position payload',
        value: {
          title: 'Senior Backend Engineer',
          description: 'Owns backend service design and delivery.',
          departmentId: '1f31a301-dfb8-4071-aab1-ad6bc4891da7',
          isActive: true,
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Position created successfully.',
    type: PositionResponseDto,
  })
  @ApiDefaultErrors({
    path: '/api/v1/positions',
    badRequest: 'Position title is required',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
    notFound: 'Department not found',
  })
  @ResponseMessage('Position created successfully')
  createPosition(@Body() dto: CreatePositionDto) {
    return this.createPositionUseCase.execute(dto);
  }

  @Get()
  @Roles(PositionPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/positions',
    roles: [PositionPermissions.VIEW],
  })
  @ApiOperation({
    summary: 'List positions',
    description:
      'Returns position catalog entries sorted alphabetically by title.',
  })
  @ApiQuery({
    name: 'departmentId',
    required: false,
    description: 'Filter positions by department id.',
    schema: { type: 'string', format: 'uuid' },
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    description: 'Filter positions by active status.',
    schema: { type: 'boolean' },
  })
  @ApiOkResponse({
    description: 'Position catalog entries.',
    type: PositionResponseDto,
    isArray: true,
  })
  @ApiDefaultErrors({
    path: '/api/v1/positions',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  @ResponseMessage('Positions retrieved successfully')
  listPositions(@Query() query: ListPositionsQueryDto) {
    return this.listPositionsUseCase.execute(query);
  }

  @Get(':positionId')
  @Roles(PositionPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/positions/:positionId',
    roles: [PositionPermissions.VIEW],
  })
  @ApiOperation({
    summary: 'Get position',
    description: 'Returns a single position by its identifier.',
  })
  @ApiParam({
    name: 'positionId',
    description: 'Position identifier.',
    example: '8b76752b-df18-45bc-af74-1ea9a0db2e40',
  })
  @ApiOkResponse({
    description: 'Position details.',
    type: PositionResponseDto,
  })
  @ApiDefaultErrors({
    path: '/api/v1/positions/8b76752b-df18-45bc-af74-1ea9a0db2e40',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
    notFound: 'Position not found',
  })
  @ResponseMessage('Position retrieved successfully')
  getPosition(@Param('positionId') positionId: string) {
    return this.getPositionUseCase.execute(positionId);
  }

  @Put(':positionId')
  @Roles(PositionPermissions.UPDATE)
  @Audit('position.update', 'system.position')
  @AuditState({
    resourceIdKey: 'params.positionId',
    loadBefore: true,
    entity: 'position',
  })
  @ApiProtected({
    path: '/api/v1/positions/:positionId',
    roles: [PositionPermissions.UPDATE],
  })
  @ApiOperation({
    summary: 'Update position',
    description: 'Updates a position catalog entry by its identifier.',
  })
  @ApiParam({
    name: 'positionId',
    description: 'Position identifier.',
    example: '8b76752b-df18-45bc-af74-1ea9a0db2e40',
  })
  @ApiBody({
    type: UpdatePositionDto,
    examples: {
      updatePosition: {
        summary: 'Update position payload',
        value: {
          title: 'Principal Backend Engineer',
          isActive: false,
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Position updated successfully.',
    type: PositionResponseDto,
  })
  @ApiDefaultErrors({
    path: '/api/v1/positions/8b76752b-df18-45bc-af74-1ea9a0db2e40',
    badRequest: 'Position title is required',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
    notFound: 'Position not found',
  })
  @ResponseMessage('Position updated successfully')
  updatePosition(
    @Param('positionId') positionId: string,
    @Body() dto: UpdatePositionDto,
  ) {
    return this.updatePositionUseCase.execute(positionId, dto);
  }

  @Delete(':positionId')
  @Roles(PositionPermissions.DELETE)
  @Audit('position.delete', 'system.position')
  @AuditState({
    resourceIdKey: 'params.positionId',
    loadBefore: true,
    entity: 'position',
  })
  @ApiProtected({
    path: '/api/v1/positions/:positionId',
    roles: [PositionPermissions.DELETE],
  })
  @ApiOperation({
    summary: 'Delete position',
    description: 'Deletes a position catalog entry by its identifier.',
  })
  @ApiParam({
    name: 'positionId',
    description: 'Position identifier.',
    example: '8b76752b-df18-45bc-af74-1ea9a0db2e40',
  })
  @ApiOkResponse({
    description: 'Position deletion status.',
    schema: {
      example: {
        success: true,
      },
    },
  })
  @ApiDefaultErrors({
    path: '/api/v1/positions/8b76752b-df18-45bc-af74-1ea9a0db2e40',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
    notFound: 'Position not found',
  })
  @ResponseMessage('Position deleted successfully')
  deletePosition(@Param('positionId') positionId: string) {
    return this.deletePositionUseCase.execute(positionId);
  }
}
