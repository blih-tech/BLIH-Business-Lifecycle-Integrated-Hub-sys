import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../platform/prisma/prisma.service';

@Injectable()
export class HrUserLifecycleService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserForLeave(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        lifecycle: { select: { status: true } },
        employment: { select: { employmentType: true } },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.lifecycle?.status === 'TERMINATED') {
      throw new BadRequestException(
        'Leave requests are blocked for terminated employees',
      );
    }

    return user;
  }

  async assertAttendanceAllowed(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        lifecycle: { select: { status: true } },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.lifecycle?.status === 'TERMINATED') {
      throw new BadRequestException(
        'Attendance cannot be recorded for terminated employees',
      );
    }

    return user;
  }
}
