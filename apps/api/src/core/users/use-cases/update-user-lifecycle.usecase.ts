import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import { UpdateUserLifecycleDto } from '../dto/update-user-lifecycle.dto';

@Injectable()
export class UpdateUserLifecycleUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userIdOrKeycloakId: string, dto: UpdateUserLifecycleDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ id: userIdOrKeycloakId }, { keycloakId: userIdOrKeycloakId }],
      },
      select: { id: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.status === 'TERMINATED' && !dto.terminatedAt) {
      throw new BadRequestException(
        'terminatedAt is required when setting lifecycle status TERMINATED',
      );
    }

    const lifecycle = await this.prisma.userLifecycle.upsert({
      where: { userId: user.id },
      update: {
        ...(dto.status !== undefined ? { status: dto.status } : {}),
        ...(dto.onboardedAt !== undefined
          ? { onboardedAt: new Date(dto.onboardedAt) }
          : {}),
        ...(dto.suspendedAt !== undefined
          ? { suspendedAt: new Date(dto.suspendedAt) }
          : {}),
        ...(dto.terminatedAt !== undefined
          ? { terminatedAt: new Date(dto.terminatedAt) }
          : {}),
        ...(dto.terminationReason !== undefined
          ? { terminationReason: dto.terminationReason }
          : {}),
        ...(dto.offboardingCompleted !== undefined
          ? { offboardingCompleted: dto.offboardingCompleted }
          : {}),
      },
      create: {
        userId: user.id,
        status: dto.status ?? 'ONBOARDING',
        ...(dto.onboardedAt !== undefined
          ? { onboardedAt: new Date(dto.onboardedAt) }
          : {}),
        ...(dto.suspendedAt !== undefined
          ? { suspendedAt: new Date(dto.suspendedAt) }
          : {}),
        ...(dto.terminatedAt !== undefined
          ? { terminatedAt: new Date(dto.terminatedAt) }
          : {}),
        terminationReason: dto.terminationReason,
        offboardingCompleted: dto.offboardingCompleted ?? false,
      },
    });

    return {
      ...lifecycle,
      onboardedAt: lifecycle.onboardedAt?.toISOString() ?? null,
      suspendedAt: lifecycle.suspendedAt?.toISOString() ?? null,
      terminatedAt: lifecycle.terminatedAt?.toISOString() ?? null,
      createdAt: lifecycle.createdAt.toISOString(),
      updatedAt: lifecycle.updatedAt.toISOString(),
    };
  }
}
