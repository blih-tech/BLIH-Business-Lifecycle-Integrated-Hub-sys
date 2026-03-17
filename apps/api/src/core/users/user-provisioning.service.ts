import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { env } from '../../config/env.config';
import { ensureEmployeeForUser } from '../../domains/hr/employees/employee-subject.utils';
import { KeycloakAdminService } from '../../platform/keycloak/keycloak-admin.service';
import {
  EmploymentType,
  LifecycleStatus,
  PayFrequency,
  Prisma,
} from '../../platform/prisma/prisma-client';
import { PrismaService } from '../../platform/prisma/prisma.service';

type CreateExternalUserInput = {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  enabled?: boolean;
};

type CreateLocalEmploymentInput = {
  positionId?: string | null;
  employmentType?: EmploymentType | null;
  managerEmploymentId?: string | null;
  hiredAt?: Date | null;
  employeeCode?: string | null;
  changeReason?: string | null;
  changedById?: string | null;
};

type CreateLocalCompensationInput = {
  baseSalary?: Prisma.Decimal | string | number | null;
  currency?: string | null;
  payFrequency?: PayFrequency | null;
  bonusEligible?: boolean;
  bonusRate?: Prisma.Decimal | string | number | null;
  effectiveFrom?: Date | null;
  effectiveTo?: Date | null;
  changeReason?: string | null;
  changedById?: string | null;
};

type CreateLocalUserGraphInput = {
  keycloakId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  metadata?: Prisma.InputJsonValue | null;
  lifecycleStatus?: LifecycleStatus;
  employment?: CreateLocalEmploymentInput | null;
  compensation?: CreateLocalCompensationInput | null;
};

@Injectable()
export class UserProvisioningService {
  private readonly logger = new Logger(UserProvisioningService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly keycloakAdmin: KeycloakAdminService,
  ) {}

  async assertLocalIdentityAvailable(input: {
    email: string;
    username: string;
  }): Promise<void> {
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: input.email }, { username: input.username }],
      },
      select: {
        email: true,
        username: true,
      },
    });

    if (!existing) {
      return;
    }

    if (existing.email === input.email) {
      throw new ConflictException('User with the same email already exists');
    }

    throw new ConflictException('User with the same username already exists');
  }

  async generateUniqueUsername(input: {
    email: string;
    firstName: string;
    lastName: string;
  }): Promise<string> {
    const emailLocalPart = input.email.split('@')[0] ?? '';
    const emailCandidate = this.normalizeUsernameCandidate(emailLocalPart);
    const nameCandidate = this.normalizeUsernameCandidate(
      `${input.firstName}.${input.lastName}`,
    );
    const base = emailCandidate || nameCandidate || 'user';

    let suffix = 0;
    while (true) {
      const candidate =
        suffix === 0 ? base : this.appendNumericSuffix(base, suffix);
      const existing = await this.prisma.user.findUnique({
        where: { username: candidate },
        select: { id: true },
      });

      if (!existing) {
        return candidate;
      }

      suffix += 1;
    }
  }

  async createExternalUser(input: CreateExternalUserInput): Promise<string> {
    try {
      return (
        (await this.keycloakAdmin.createUser(env.KEYCLOAK_REALM, {
          email: input.email,
          username: input.username,
          enabled: input.enabled ?? true,
          firstName: input.firstName,
          lastName: input.lastName,
          attributes: input.phone ? { phone: [input.phone] } : undefined,
        })) ?? `${input.email}-${Date.now()}`
      );
    } catch (error: unknown) {
      this.rethrowCreateUserError(error);
    }
  }

  async cleanupExternalUser(keycloakId: string): Promise<void> {
    try {
      await this.keycloakAdmin.deleteUser(env.KEYCLOAK_REALM, keycloakId);
      return;
    } catch (deleteError) {
      this.logger.warn(
        `Failed to delete provisioned Keycloak user ${keycloakId}; attempting disable`,
      );
      try {
        await this.keycloakAdmin.disableUser(env.KEYCLOAK_REALM, keycloakId);
      } catch (disableError) {
        this.logger.error(
          JSON.stringify({
            action: 'user.provisioning.cleanup.failure',
            keycloakId,
            deleteError:
              deleteError instanceof Error
                ? deleteError.message
                : 'unknown delete failure',
            disableError:
              disableError instanceof Error
                ? disableError.message
                : 'unknown disable failure',
          }),
        );
      }
    }
  }

  async sendRequiredActionsEmail(input: {
    keycloakId: string;
    actions: string[];
    lifespanSeconds?: number;
  }): Promise<void> {
    await this.keycloakAdmin.executeActionsEmail(
      env.KEYCLOAK_REALM,
      input.keycloakId,
      input.actions,
      input.lifespanSeconds,
    );
  }

  async createLocalUserGraph(
    tx: Prisma.TransactionClient,
    input: CreateLocalUserGraphInput,
  ) {
    const createdUser = await tx.user.create({
      data: {
        keycloakId: input.keycloakId,
        username: input.username,
        email: input.email,
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone ?? undefined,
        ...(input.metadata !== undefined && {
          metadata: input.metadata ?? Prisma.JsonNull,
        }),
      },
    });

    const employee = await ensureEmployeeForUser(
      tx as PrismaService,
      createdUser.id,
    );

    let employment: {
      id: string;
      employeeId: string;
      employeeCode: string | null;
      positionId: string | null;
      employmentType: EmploymentType;
      managerEmploymentId: string | null;
      hiredAt: Date | null;
      probationEndAt: Date | null;
      confirmedAt: Date | null;
      createdAt: Date;
      updatedAt: Date;
    } | null = null;

    if (input.employment) {
      let departmentId: string | null = null;
      if (input.employment.positionId) {
        const position = await tx.position.findUnique({
          where: { id: input.employment.positionId },
          select: { departmentId: true },
        });
        departmentId = position?.departmentId ?? null;
      }

      employment = await tx.userEmployment.create({
        data: {
          employeeId: employee.id,
          employeeCode: input.employment.employeeCode ?? undefined,
          positionId: input.employment.positionId ?? undefined,
          employmentType: input.employment.employmentType ?? 'FULL_TIME',
          managerEmploymentId:
            input.employment.managerEmploymentId ?? undefined,
          hiredAt: input.employment.hiredAt ?? undefined,
        },
      });

      await tx.userEmploymentHistory.create({
        data: {
          userEmploymentId: employment.id,
          employeeCode: employment.employeeCode,
          departmentId,
          positionId: employment.positionId,
          employmentType: employment.employmentType,
          managerEmploymentId: employment.managerEmploymentId,
          effectiveFrom: employment.hiredAt ?? new Date(),
          changeReason: input.employment.changeReason ?? undefined,
          changedById: input.employment.changedById ?? undefined,
        },
      });
    }

    let compensation: {
      id: string;
      employeeId: string;
      baseSalary: Prisma.Decimal | null;
      currency: string | null;
      payFrequency: PayFrequency;
      bonusEligible: boolean;
      bonusRate: Prisma.Decimal | null;
      effectiveFrom: Date | null;
      effectiveTo: Date | null;
      createdAt: Date;
      updatedAt: Date;
    } | null = null;

    if (input.compensation) {
      compensation = await tx.userCompensation.create({
        data: {
          employeeId: employee.id,
          ...(input.compensation.baseSalary != null && {
            baseSalary: input.compensation.baseSalary,
          }),
          currency: input.compensation.currency ?? undefined,
          payFrequency: input.compensation.payFrequency ?? 'MONTHLY',
          bonusEligible: input.compensation.bonusEligible ?? false,
          ...(input.compensation.bonusRate != null && {
            bonusRate: input.compensation.bonusRate,
          }),
          effectiveFrom: input.compensation.effectiveFrom ?? undefined,
          effectiveTo: input.compensation.effectiveTo ?? undefined,
        },
      });

      await tx.userCompensationHistory.create({
        data: {
          employeeId: employee.id,
          baseSalary: compensation.baseSalary,
          currency: compensation.currency,
          payFrequency: compensation.payFrequency,
          bonusEligible: compensation.bonusEligible,
          bonusRate: compensation.bonusRate,
          validFrom:
            compensation.effectiveFrom ??
            input.compensation.effectiveFrom ??
            new Date(),
          validTo: compensation.effectiveTo,
          changeReason: input.compensation.changeReason ?? undefined,
          changedById: input.compensation.changedById ?? undefined,
        },
      });
    }

    const lifecycle = await tx.userLifecycle.upsert({
      where: {
        employeeId: employee.id,
      },
      update: {
        status: input.lifecycleStatus ?? 'ONBOARDING',
      },
      create: {
        employeeId: employee.id,
        status: input.lifecycleStatus ?? 'ONBOARDING',
      },
    });

    return {
      user: createdUser,
      employee,
      employment,
      compensation,
      lifecycle,
    };
  }

  rethrowPersistenceError(error: unknown): never {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: string }).code === 'P2002'
    ) {
      throw new ConflictException('User already exists');
    }

    throw error;
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

  private normalizeUsernameCandidate(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, '.')
      .replace(/[._-]{2,}/g, '.')
      .replace(/^[._-]+|[._-]+$/g, '')
      .slice(0, 48);
  }

  private appendNumericSuffix(base: string, suffix: number): string {
    const normalizedSuffix = `${suffix}`;
    const safeBase = base.slice(0, Math.max(1, 48 - normalizedSuffix.length));
    return `${safeBase}${normalizedSuffix}`;
  }
}
