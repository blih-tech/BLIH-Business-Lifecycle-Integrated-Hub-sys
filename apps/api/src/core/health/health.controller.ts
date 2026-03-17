import { HttpService } from '@nestjs/axios';
import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { Public } from '../../shared/decorators/public.decorator';
import { ResponseMessage } from '../../shared/decorators/response-message.decorator';
import {
  ApiErrorResponseDto,
  createEnvelopeErrorExample,
} from '../../shared/docs/openapi';
import { PrismaService } from '../../platform/prisma/prisma.service';
import { HealthCheckResponseDto } from './dto/health-check-response.dto';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Health check',
    description:
      'Returns the aggregated health state of the database, Keycloak, and SMTP configuration.',
  })
  @ApiOkResponse({
    description: 'Health check result.',
    type: HealthCheckResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected health check failure.',
    type: ApiErrorResponseDto,
    schema: {
      example: createEnvelopeErrorExample({
        message: 'Internal server error',
        code: 'INTERNAL_SERVER_ERROR',
        details: 'An unexpected error occurred',
      }),
    },
  })
  @ResponseMessage('Health status retrieved successfully')
  async check() {
    const checks = {
      database: await this.databaseCheck(),
      keycloak: await this.keycloakCheck(),
      smtp: this.smtpCheck(),
    };

    const overall = Object.values(checks).every(
      (entry) => entry.status === 'up',
    )
      ? 'up'
      : 'degraded';

    return {
      status: overall,
      checks,
      timestamp: new Date().toISOString(),
    };
  }

  private async databaseCheck() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'up' as const };
    } catch (error) {
      return { status: 'down' as const, error: this.getMessage(error) };
    }
  }

  private async keycloakCheck() {
    try {
      const baseUrl = this.configService.getOrThrow<string>('KEYCLOAK_URL');
      const realm = this.configService.get<string>('KEYCLOAK_REALM', 'master');
      await firstValueFrom(this.httpService.get(`${baseUrl}/realms/${realm}`));
      return { status: 'up' as const };
    } catch (error) {
      return { status: 'down' as const, error: this.getMessage(error) };
    }
  }

  private smtpCheck() {
    const enabled =
      this.configService.get<string>('SMTP_ENABLED', 'false') === 'true';
    return enabled
      ? { status: 'up' as const }
      : { status: 'up' as const, mode: 'disabled' };
  }

  private getMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'unknown error';
  }
}
