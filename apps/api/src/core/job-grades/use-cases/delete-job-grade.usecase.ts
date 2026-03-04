import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../platform/prisma/prisma.service';

@Injectable()
export class DeleteJobGradeUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(jobGradeId: string) {
    const positionCount = await this.prisma.position.count({
      where: { gradeId: jobGradeId },
    });
    if (positionCount > 0) {
      throw new ConflictException(
        'Job grade cannot be deleted while positions still reference it',
      );
    }

    try {
      await this.prisma.jobGrade.delete({
        where: { id: jobGradeId },
      });
    } catch {
      throw new NotFoundException('Job grade not found');
    }

    return { success: true };
  }
}
