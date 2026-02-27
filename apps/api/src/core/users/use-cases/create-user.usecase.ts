import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { env } from '../../../config/env.config';
import { KeycloakAdminService } from '../../../platform/keycloak/keycloak-admin.service';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import { CreateUserDto } from '../dto/create-user.dto';

@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly keycloakAdmin: KeycloakAdminService,
    private readonly prisma: PrismaService,
  ) {}

  async execute(dto: CreateUserDto) {
    if (dto.departmentId) {
      const department = await this.prisma.department.findUnique({
        where: { id: dto.departmentId },
        select: { id: true },
      });
      if (!department) {
        throw new NotFoundException('Department not found');
      }
    }

    const realmName = env.KEYCLOAK_REALM;
    const username = dto.username.trim();
    let keycloakId: string;
    try {
      keycloakId =
        (await this.keycloakAdmin.createUser(realmName, {
          email: dto.email,
          username,
          enabled: true,
          firstName: dto.firstName,
          lastName: dto.lastName,
        })) ?? `${dto.email}-${Date.now()}`;
    } catch (error: unknown) {
      this.rethrowCreateUserError(error);
    }

    const user = await this.prisma.user.create({
      data: {
        keycloakId,
        username,
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        departmentId: dto.departmentId,
      },
    });

    await this.prisma.userLifecycle.upsert({
      where: {
        userId: user.id,
      },
      update: {},
      create: {
        userId: user.id,
        status: 'ONBOARDING',
      },
    });

    return user;
  }

  private rethrowCreateUserError(error: unknown): never {
    const response = (
      error as {
        response?: {
          status?: number;
          data?: unknown;
        };
      }
    ).response;

    const status = response?.status;
    const details = this.formatKeycloakErrorDetails(response?.data);

    if (status === 400) {
      throw new BadRequestException({
        message: 'Invalid user payload',
        details,
      });
    }

    if (status === 409) {
      throw new ConflictException({
        message: 'User already exists',
        details,
      });
    }

    throw error;
  }

  private formatKeycloakErrorDetails(data: unknown): string {
    const fallback = 'Keycloak rejected the user payload';

    if (!data || typeof data !== 'object') {
      return fallback;
    }

    const payload = data as {
      field?: unknown;
      errorMessage?: unknown;
      params?: unknown;
      error?: unknown;
      error_description?: unknown;
    };

    if (
      typeof payload.field === 'string' &&
      typeof payload.errorMessage === 'string'
    ) {
      if (payload.errorMessage === 'error-username-invalid-character') {
        return `${payload.field} contains invalid characters. Use letters, numbers, dots, underscores, and hyphens only.`;
      }
      return `${payload.field}: ${payload.errorMessage}`;
    }

    if (typeof payload.error_description === 'string') {
      return payload.error_description;
    }

    if (typeof payload.error === 'string') {
      return payload.error;
    }

    return fallback;
  }
}
