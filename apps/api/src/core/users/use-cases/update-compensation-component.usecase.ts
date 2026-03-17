import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import { mapCompensationComponent } from '../compensation-component.mapper';
import { UpdateCompensationComponentDto } from '../dto/update-compensation-component.dto';
import {
  ensureEmployeeForUser,
  resolveEmployeeSubjectOrThrow,
} from '../../../domains/hr/employees/employee-subject.utils';

@Injectable()
export class UpdateCompensationComponentUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    userIdOrKeycloakId: string,
    componentId: string,
    dto: UpdateCompensationComponentDto,
  ) {
    const employee = await resolveEmployeeSubjectOrThrow(
      this.prisma,
      userIdOrKeycloakId,
      'Employee not found',
    ).catch(async (error) => {
      const user = await this.prisma.user.findFirst({
        where: {
          OR: [{ id: userIdOrKeycloakId }, { keycloakId: userIdOrKeycloakId }],
        },
        select: { id: true },
      });
      if (!user) {
        throw error;
      }
      return ensureEmployeeForUser(this.prisma, user.id);
    });

    const existing = await this.prisma.compensationComponent.findFirst({
      where: { id: componentId, employeeId: employee.id },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundException('Compensation component not found');
    }

    const effectiveFrom =
      dto.effectiveFrom !== undefined ? new Date(dto.effectiveFrom) : undefined;
    const effectiveTo =
      dto.effectiveTo !== undefined
        ? dto.effectiveTo
          ? new Date(dto.effectiveTo)
          : null
        : undefined;
    if (
      effectiveFrom &&
      effectiveTo &&
      effectiveFrom.getTime() >= effectiveTo.getTime()
    ) {
      throw new BadRequestException('effectiveFrom must be before effectiveTo');
    }

    const component = await this.prisma.compensationComponent.update({
      where: { id: componentId },
      data: {
        employeeId: employee.id,
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        ...(dto.type !== undefined ? { type: dto.type } : {}),
        ...(dto.amount !== undefined ? { amount: dto.amount } : {}),
        ...(dto.isRecurring !== undefined
          ? { isRecurring: dto.isRecurring }
          : {}),
        ...(effectiveFrom !== undefined ? { effectiveFrom } : {}),
        ...(effectiveTo !== undefined ? { effectiveTo } : {}),
      },
    });

    return mapCompensationComponent(component);
  }
}
