import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';

@Injectable()
export class ListEmployeeDocumentsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userIdOrKeycloakId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ id: userIdOrKeycloakId }, { keycloakId: userIdOrKeycloakId }],
      },
      select: { id: true },
    });
    if (!user) throw new NotFoundException('User not found');

    const docs = await this.prisma.employeeDocument.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return docs.map((d) => ({
      id: d.id,
      userId: d.userId,
      type: d.type,
      typeOther: d.typeOther ?? null,
      fileUrl: d.fileUrl,
      fileName: d.fileName ?? null,
      fileSizeBytes: d.fileSizeBytes ?? null,
      mimeType: d.mimeType ?? null,
      issueDate: d.issueDate?.toISOString().slice(0, 10) ?? null,
      expiryDate: d.expiryDate?.toISOString().slice(0, 10) ?? null,
      isMandatory: d.isMandatory,
      verified: d.verified,
      verifiedById: d.verifiedById ?? null,
      verifiedAt: d.verifiedAt?.toISOString() ?? null,
      createdAt: d.createdAt.toISOString(),
      updatedAt: d.updatedAt.toISOString(),
    }));
  }
}
