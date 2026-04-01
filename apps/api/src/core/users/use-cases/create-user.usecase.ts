import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserProvisioningService } from '../user-provisioning.service';

@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly provisioning: UserProvisioningService,
  ) {}

  async execute(dto: CreateUserDto) {
    const username = dto.username.trim();
    await this.provisioning.assertLocalIdentityAvailable({
      email: dto.email,
      username,
    });

    const keycloakId = await this.provisioning.createExternalUser({
      email: dto.email,
      username,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
    });

    try {
      const provisioned = await this.prisma.$transaction((tx) =>
        this.provisioning.createLocalUserGraph(tx, {
          keycloakId,
          username,
          email: dto.email,
          firstName: dto.firstName,
          lastName: dto.lastName,
          phone: dto.phone,
          lifecycleStatus: 'ONBOARDING',
        }),
      );

      return provisioned.user;
    } catch (error: unknown) {
      await this.provisioning.cleanupExternalUser(keycloakId);
      this.provisioning.rethrowPersistenceError(error);
    }
  }
}
