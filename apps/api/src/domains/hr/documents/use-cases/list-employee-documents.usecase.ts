import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { resolveEmployeeSubjectOrThrow } from '../../employees/employee-subject.utils';

@Injectable()
export class ListEmployeeDocumentsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(employeeIdOrUserIdOrKeycloakId: string) {
    const employee = await resolveEmployeeSubjectOrThrow(
      this.prisma,
      employeeIdOrUserIdOrKeycloakId,
    );

    const docs = await this.prisma.employeeDocument.findMany({
      where: { employeeId: employee.id },
      orderBy: { createdAt: 'desc' },
    });

    return docs.map((d) => ({
      id: d.id,
      employeeId: d.employeeId,
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
