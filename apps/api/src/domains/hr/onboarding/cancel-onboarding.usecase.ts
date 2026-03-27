import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import { mapOnboarding, onboardingInclude } from './create-onboarding.usecase';
import type { OnboardingResponseDto } from './onboarding.dto';

@Injectable()
export class CancelOnboardingUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string): Promise<OnboardingResponseDto> {
    const existing = await this.prisma.onboarding.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!existing) {
      throw new NotFoundException(`Onboarding with id "${id}" not found`);
    }

    if (existing.status === 'CANCELLED') {
      throw new BadRequestException('Onboarding is already cancelled');
    }

    const cancelled = await this.prisma.onboarding.update({
      where: { id },
      data: {
        status: 'CANCELLED',
      },
      include: onboardingInclude,
    });

    return mapOnboarding(cancelled);
  }
}
