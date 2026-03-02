import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import { mapCompensationComponent } from '../compensation-component.mapper';
import { CreateCompensationComponentDto } from '../dto/create-compensation-component.dto';

@Injectable()
export class CreateCompensationComponentUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    userIdOrKeycloakId: string,
    dto: CreateCompensationComponentDto,
  ) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ id: userIdOrKeycloakId }, { keycloakId: userIdOrKeycloakId }],
      },
      select: { id: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const effectiveFrom = new Date(dto.effectiveFrom);
    const effectiveTo = dto.effectiveTo ? new Date(dto.effectiveTo) : null;
    if (effectiveTo && effectiveFrom.getTime() >= effectiveTo.getTime()) {
      throw new BadRequestException('effectiveFrom must be before effectiveTo');
    }

    const component = await this.prisma.compensationComponent.create({
      data: {
        userId: user.id,
        name: dto.name.trim(),
        type: dto.type,
        amount: dto.amount,
        isRecurring: dto.isRecurring,
        effectiveFrom,
        effectiveTo,
      },
    });

    return mapCompensationComponent(component);
  }
}
