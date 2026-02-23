import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import { SecurityPolicyDto } from '../dto/security-policy.dto';

@Injectable()
export class UpdateSecurityPolicyUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: SecurityPolicyDto) {
    const existing = await this.prisma.securityPolicy.findFirst();
    const policy = existing
      ? await this.prisma.securityPolicy.update({
          where: { id: existing.id },
          data: {
            requireMfa: dto.requireMfa,
            maxConcurrentSessions: dto.maxConcurrentSessions,
            sessionTimeoutMinutes: dto.sessionTimeoutMinutes,
            passwordMinLength: dto.passwordMinLength,
            lockoutThreshold: dto.lockoutThreshold,
          },
        })
      : await this.prisma.securityPolicy.create({
          data: {
            requireMfa: dto.requireMfa,
            maxConcurrentSessions: dto.maxConcurrentSessions,
            sessionTimeoutMinutes: dto.sessionTimeoutMinutes,
            passwordMinLength: dto.passwordMinLength,
            lockoutThreshold: dto.lockoutThreshold,
          },
        });

    return policy;
  }
}
