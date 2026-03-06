import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CandidatePermissions } from '../../../core/rbac/constants/permissions.constants';
import { Audit } from '../../../shared/decorators/audit.decorator';
import { Roles } from '../../../shared/decorators/roles.decorator';
import {
  ApiDefaultErrors,
  ApiEnvelopeArrayResponse,
  ApiEnvelopeOkResponse,
  ApiProtected,
} from '../../../shared/docs/openapi';
import { KeycloakAuthGuard } from '../../../shared/guards/keycloak-auth.guard';
import { RbacGuard } from '../../../shared/guards/rbac.guard';
import {
  CandidateListQueryDto,
  CandidateResponseDto,
  CreateCandidateDto,
  UpdateCandidateDto,
} from './dto/candidate.dto';
import {
  candidateListResponseEnvelope,
  candidateResponseEnvelope,
} from './recruitment.swagger-examples';
import {
  CreateCandidateUseCase,
  GetCandidateUseCase,
  ListCandidatesUseCase,
  UpdateCandidateUseCase,
} from './use-cases/candidates.usecases';

@ApiTags('HR Recruitment Candidates')
@Controller('hr/recruitment/candidates')
@UseGuards(KeycloakAuthGuard, RbacGuard)
export class CandidatesController {
  constructor(
    private readonly createCandidate: CreateCandidateUseCase,
    private readonly listCandidates: ListCandidatesUseCase,
    private readonly getCandidateById: GetCandidateUseCase,
    private readonly updateCandidateById: UpdateCandidateUseCase,
  ) {}

  @Post()
  @Roles(CandidatePermissions.CREATE)
  @Audit('recruitment.candidate.create', 'hr.candidate')
  @ApiProtected({
    path: '/api/v1/hr/recruitment/candidates',
    roles: [CandidatePermissions.CREATE],
  })
  @ApiOperation({ summary: 'Create candidate' })
  @ApiBody({
    type: CreateCandidateDto,
    description:
      'Request body: firstName (required), lastName (required), email (required). Optional: phone, gender, yearsExperience, linkedinUrl, portfolioUrl, githubUrl, source, referredById, resumeUrl, skills (array of { name, level, years }).',
    examples: {
      createCandidate: {
        summary: 'Create candidate payload (minimal)',
        value: {
          firstName: 'Abel',
          lastName: 'Tesfaye',
          email: 'abel.tesfaye@example.com',
          source: 'LINKEDIN',
          yearsExperience: 6,
          skills: [{ name: 'NestJS', level: 'ADVANCED', years: 4 }],
        },
      },
      createCandidateFull: {
        summary: 'Create candidate payload (full structure)',
        value: {
          firstName: 'Abel',
          lastName: 'Tesfaye',
          email: 'abel.tesfaye@example.com',
          phone: '+251912345678',
          gender: 'MALE',
          yearsExperience: 6,
          linkedinUrl: 'https://linkedin.com/in/abeltesfaye',
          portfolioUrl: null,
          githubUrl: 'https://github.com/abeltesfaye',
          source: 'LINKEDIN',
          resumeUrl: 'https://cdn.example.com/cv/abel.pdf',
          skills: [
            { name: 'NestJS', level: 'ADVANCED', years: 4 },
            { name: 'PostgreSQL', level: 'INTERMEDIATE', years: 3 },
          ],
        },
      },
    },
  })
  @ApiEnvelopeOkResponse(
    CandidateResponseDto,
    'Created candidate',
    candidateResponseEnvelope,
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/recruitment/candidates',
    badRequest: 'Candidate payload is invalid',
    conflict: 'Candidate email already exists',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  create(@Body() body: CreateCandidateDto) {
    return this.createCandidate.execute(body);
  }

  @Get()
  @Roles(CandidatePermissions.VIEW)
  @Audit('recruitment.candidate.list', 'hr.candidate')
  @ApiProtected({
    path: '/api/v1/hr/recruitment/candidates',
    roles: [CandidatePermissions.VIEW],
  })
  @ApiOperation({ summary: 'List candidates' })
  @ApiEnvelopeArrayResponse(
    CandidateResponseDto,
    'List of candidates',
    candidateListResponseEnvelope,
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/recruitment/candidates',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  list(@Query() query: CandidateListQueryDto) {
    return this.listCandidates.execute(query);
  }

  @Get(':id')
  @Roles(CandidatePermissions.VIEW)
  @Audit('recruitment.candidate.get', 'hr.candidate')
  @ApiProtected({
    path: '/api/v1/hr/recruitment/candidates/:id',
    roles: [CandidatePermissions.VIEW],
  })
  @ApiOperation({ summary: 'Get candidate' })
  @ApiParam({ name: 'id', description: 'Candidate id' })
  @ApiEnvelopeOkResponse(
    CandidateResponseDto,
    'Candidate details',
    candidateResponseEnvelope,
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/recruitment/candidates/:id',
    notFound: 'Candidate not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  get(@Param('id') id: string) {
    return this.getCandidateById.execute(id);
  }

  @Patch(':id')
  @Roles(CandidatePermissions.UPDATE)
  @Audit('recruitment.candidate.update', 'hr.candidate')
  @ApiProtected({
    path: '/api/v1/hr/recruitment/candidates/:id',
    roles: [CandidatePermissions.UPDATE],
  })
  @ApiOperation({ summary: 'Update candidate' })
  @ApiParam({ name: 'id', description: 'Candidate id' })
  @ApiBody({
    type: UpdateCandidateDto,
    description:
      'Request body: partial candidate fields (all optional). Same structure as create; send only fields to update.',
    examples: {
      updateCandidate: {
        summary: 'Update candidate payload',
        value: {
          phone: '+251912345678',
          githubUrl: 'https://github.com/abeltesfaye',
          skills: [{ name: 'PostgreSQL', level: 'ADVANCED', years: 5 }],
        },
      },
      updateCandidateExtended: {
        summary: 'Update multiple fields',
        value: {
          yearsExperience: 7,
          linkedinUrl: 'https://linkedin.com/in/abeltesfaye-updated',
          resumeUrl: 'https://cdn.example.com/cv/abel-v2.pdf',
        },
      },
    },
  })
  @ApiEnvelopeOkResponse(
    CandidateResponseDto,
    'Updated candidate',
    candidateResponseEnvelope,
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/recruitment/candidates/:id',
    badRequest: 'Candidate payload is invalid',
    notFound: 'Candidate not found',
    conflict: 'Candidate email already exists',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  update(@Param('id') id: string, @Body() body: UpdateCandidateDto) {
    return this.updateCandidateById.execute(id, body);
  }
}
