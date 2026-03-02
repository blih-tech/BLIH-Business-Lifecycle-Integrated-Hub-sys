import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import type { UpdateEmployeeDocumentDto } from '@repo/types';

@Injectable()
export class UpdateEmployeeDocumentUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    userIdOrKeycloakId: string,
    documentId: string,
    dto: UpdateEmployeeDocumentDto,
  ) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ id: userIdOrKeycloakId }, { keycloakId: userIdOrKeycloakId }],
      },
      select: { id: true },
    });
    if (!user) throw new NotFoundException('User not found');

    const existing = await this.prisma.employeeDocument.findFirst({
      where: { id: documentId, userId: user.id },
    });
    if (!existing) throw new NotFoundException('Document not found');

    if (dto.verifiedById) {
      const verifier = await this.prisma.user.findUnique({
        where: { id: dto.verifiedById },
        select: { id: true },
      });
      if (!verifier) throw new NotFoundException('Verifier not found');
    }

    const doc = await this.prisma.employeeDocument.update({
      where: { id: documentId },
      data: {
        ...(dto.typeOther !== undefined && { typeOther: dto.typeOther }),
        ...(dto.fileUrl !== undefined && { fileUrl: dto.fileUrl }),
        ...(dto.fileName !== undefined && { fileName: dto.fileName }),
        ...(dto.fileSizeBytes !== undefined && {
          fileSizeBytes: dto.fileSizeBytes,
        }),
        ...(dto.mimeType !== undefined && { mimeType: dto.mimeType }),
        ...(dto.issueDate !== undefined && {
          issueDate: dto.issueDate ? new Date(dto.issueDate) : null,
        }),
        ...(dto.expiryDate !== undefined && {
          expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
        }),
        ...(dto.isMandatory !== undefined && { isMandatory: dto.isMandatory }),
        ...(dto.verified !== undefined && { verified: dto.verified }),
        ...(dto.verifiedById !== undefined && {
          verifiedById: dto.verifiedById,
        }),
        ...(dto.verifiedAt !== undefined && {
          verifiedAt: dto.verifiedAt ? new Date(dto.verifiedAt) : null,
        }),
      },
    });

    return {
      id: doc.id,
      userId: doc.userId,
      type: doc.type,
      typeOther: doc.typeOther ?? null,
      fileUrl: doc.fileUrl,
      fileName: doc.fileName ?? null,
      fileSizeBytes: doc.fileSizeBytes ?? null,
      mimeType: doc.mimeType ?? null,
      issueDate: doc.issueDate?.toISOString().slice(0, 10) ?? null,
      expiryDate: doc.expiryDate?.toISOString().slice(0, 10) ?? null,
      isMandatory: doc.isMandatory,
      verified: doc.verified,
      verifiedById: doc.verifiedById ?? null,
      verifiedAt: doc.verifiedAt?.toISOString() ?? null,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }
}
