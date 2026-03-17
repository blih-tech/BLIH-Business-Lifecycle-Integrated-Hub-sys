import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Audit } from '../../shared/decorators/audit.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';
import { ResponseMessage } from '../../shared/decorators/response-message.decorator';
import { ApiDefaultErrors, ApiProtected } from '../../shared/docs/openapi';
import { KeycloakAuthGuard } from '../../shared/guards/keycloak-auth.guard';
import { RbacGuard } from '../../shared/guards/rbac.guard';
import { SystemConfigPermissions } from '@repo/types/rbac';
import { ModuleConfigDto } from './dto/module-config.dto';
import { SecurityPolicyDto } from './dto/security-policy.dto';
import { SystemConfigDto } from './dto/system-config.dto';
import { ListSystemConfigUseCase } from './use-cases/list-system-config.usecase';
import { UpdateModuleConfigUseCase } from './use-cases/update-module-config.usecase';
import { UpdateSecurityPolicyUseCase } from './use-cases/update-security-policy.usecase';
import { UpdateSystemConfigUseCase } from './use-cases/update-system-config.usecase';

@ApiTags('System Config')
@Controller('system-config')
@UseGuards(KeycloakAuthGuard, RbacGuard)
export class SystemConfigController {
  constructor(
    private readonly updateSystemConfigUseCase: UpdateSystemConfigUseCase,
    private readonly updateModuleConfigUseCase: UpdateModuleConfigUseCase,
    private readonly updateSecurityPolicyUseCase: UpdateSecurityPolicyUseCase,
    private readonly listSystemConfigUseCase: ListSystemConfigUseCase,
  ) {}

  @Get()
  @Roles(SystemConfigPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/system-config',
    roles: ['system_config:view'],
  })
  @ApiOperation({
    summary: 'List system configuration',
    description:
      'Returns the current system settings, module configuration, and security policy records.',
  })
  @ApiOkResponse({
    description: 'System configuration aggregate.',
    schema: {
      example: {
        settings: [
          {
            id: '43b2f805-6377-43d6-8137-50966890b27e',
            key: 'auth.session',
            value: { timeoutMinutes: 30 },
            updatedBy: null,
            updatedAt: '2026-02-15T10:40:00.000Z',
          },
        ],
        modules: [
          {
            id: '0d7fdcb4-f1ce-4ef4-b79a-94fdf08b56e7',
            module: 'finance',
            enabled: true,
            licenseKey: 'LIC-2026-XXXX-XXXX',
            settings: null,
            updatedAt: '2026-02-15T10:40:00.000Z',
          },
        ],
        securityPolicy: {
          id: '94853dc6-0092-45af-8f32-422c74f5f85f',
          requireMfa: true,
          maxConcurrentSessions: 3,
          sessionTimeoutMinutes: 480,
          passwordMinLength: 12,
          lockoutThreshold: 5,
          updatedAt: '2026-02-15T10:40:00.000Z',
        },
      },
    },
  })
  @ApiDefaultErrors({
    path: '/api/v1/system-config',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  @ResponseMessage('System configuration retrieved successfully')
  async list() {
    return this.listSystemConfigUseCase.execute();
  }

  @Patch('settings')
  @Roles(SystemConfigPermissions.UPDATE)
  @Audit('config.settings.update', 'system.system-config')
  @ApiProtected({
    path: '/api/v1/system-config/settings',
    roles: ['system_config:update'],
  })
  @ApiOperation({
    summary: 'Upsert system setting',
    description:
      'Creates or updates a key/value system setting in a realm. Requires role `system_config:update`.',
  })
  @ApiBody({
    type: SystemConfigDto,
    examples: {
      updateSetting: {
        summary: 'Update setting payload',
        value: {
          key: 'auth.session',
          value: { timeoutMinutes: 30, rememberMe: false },
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'System setting upserted successfully.',
    schema: {
      example: {
        id: '43b2f805-6377-43d6-8137-50966890b27e',
        key: 'auth.session',
        value: { timeoutMinutes: 30, rememberMe: false },
        updatedBy: null,
        updatedAt: '2026-02-15T10:40:00.000Z',
      },
    },
  })
  @ApiDefaultErrors({
    path: '/api/v1/system-config/settings',
    badRequest: {
      message: ['value must be an object'],
      error: 'Bad Request',
      statusCode: 400,
    },
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  @ResponseMessage('System setting updated successfully')
  async updateSetting(@Body() dto: SystemConfigDto) {
    return this.updateSystemConfigUseCase.execute(dto);
  }

  @Patch('modules')
  @Roles(SystemConfigPermissions.UPDATE)
  @Audit('config.modules.update', 'system.system-config')
  @ApiProtected({
    path: '/api/v1/system-config/modules',
    roles: ['system_config:update'],
  })
  @ApiOperation({
    summary: 'Upsert module config',
    description:
      'Creates or updates module feature flag/license settings. Requires role `system_config:update`.',
  })
  @ApiBody({
    type: ModuleConfigDto,
    examples: {
      updateModule: {
        summary: 'Update module config payload',
        value: {
          module: 'finance',
          enabled: true,
          licenseKey: 'LIC-2026-XXXX-XXXX',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Module config upserted successfully.',
    schema: {
      example: {
        id: '0d7fdcb4-f1ce-4ef4-b79a-94fdf08b56e7',
        module: 'finance',
        enabled: true,
        licenseKey: 'LIC-2026-XXXX-XXXX',
        settings: null,
        updatedAt: '2026-02-15T10:45:00.000Z',
      },
    },
  })
  @ApiDefaultErrors({
    path: '/api/v1/system-config/modules',
    badRequest: {
      message: ['enabled must be a boolean value'],
      error: 'Bad Request',
      statusCode: 400,
    },
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  @ResponseMessage('Module configuration updated successfully')
  async updateModule(@Body() dto: ModuleConfigDto) {
    return this.updateModuleConfigUseCase.execute(dto);
  }

  @Patch('security-policy')
  @Roles(SystemConfigPermissions.UPDATE)
  @Audit('config.security-policy.update', 'system.system-config')
  @ApiProtected({
    path: '/api/v1/system-config/security-policy',
    roles: ['system_config:update'],
  })
  @ApiOperation({
    summary: 'Update security policy',
    description: 'Creates or updates the realm-level security policy controls.',
  })
  @ApiBody({
    type: SecurityPolicyDto,
    examples: {
      updateSecurityPolicy: {
        summary: 'Update security policy payload',
        value: {
          requireMfa: true,
          maxConcurrentSessions: 3,
          sessionTimeoutMinutes: 480,
          passwordMinLength: 12,
          lockoutThreshold: 5,
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Security policy upserted successfully.',
    schema: {
      example: {
        id: '94853dc6-0092-45af-8f32-422c74f5f85f',
        requireMfa: true,
        maxConcurrentSessions: 3,
        sessionTimeoutMinutes: 480,
        passwordMinLength: 12,
        lockoutThreshold: 5,
        updatedAt: '2026-02-15T10:50:00.000Z',
      },
    },
  })
  @ApiDefaultErrors({
    path: '/api/v1/system-config/security-policy',
    badRequest: {
      message: ['passwordMinLength must not be less than 8'],
      error: 'Bad Request',
      statusCode: 400,
    },
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  @ResponseMessage('Security policy updated successfully')
  async updateSecurityPolicy(@Body() dto: SecurityPolicyDto) {
    return this.updateSecurityPolicyUseCase.execute(dto);
  }
}
