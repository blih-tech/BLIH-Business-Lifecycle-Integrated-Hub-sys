import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import type { CreateEmployeeDocumentDto } from '@repo/types';
import { resolveEmployeeSubjectOrThrow } from '../../employees/employee-subject.utils';

@Injectable()
export class CreateEmployeeDocumentUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    employeeIdOrUserIdOrKeycloakId: string,
    dto: CreateEmployeeDocumentDto,
  ) {
    const employee = await resolveEmployeeSubjectOrThrow(
      this.prisma,
      employeeIdOrUserIdOrKeycloakId,
    );

    const doc = await this.prisma.employeeDocument.create({
      data: {
        employeeId: employee.id,
        type: dto.type,
        typeOther: dto.typeOther ?? undefined,
        fileUrl: dto.fileUrl,
        fileName: dto.fileName ?? undefined,
        fileSizeBytes: dto.fileSizeBytes ?? undefined,
        mimeType: dto.mimeType ?? undefined,
        issueDate: dto.issueDate ? new Date(dto.issueDate) : undefined,
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : undefined,
        isMandatory: dto.isMandatory ?? false,
      },
    });

    return this.toResponse(doc);
  }

  private toResponse(doc: {
    id: string;
    employeeId: string;
    type: string;
    typeOther: string | null;
    fileUrl: string;
    fileName: string | null;
    fileSizeBytes: number | null;
    mimeType: string | null;
    issueDate: Date | null;
    expiryDate: Date | null;
    isMandatory: boolean;
    verified: boolean;
    verifiedById: string | null;
    verifiedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: doc.id,
      employeeId: doc.employeeId,
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
