import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../platform/prisma/prisma.service';

/**
 * Loads current entity state for pre-audit "before" snapshot.
 * Supports core entities: user, realm, role.
 * Domain modules can extend by registering custom loaders if needed.
 */
@Injectable()
export class AuditStateService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Loads a JSON-serializable snapshot of the entity for the given resource type and id.
   * Returns null if resource type is unknown or entity not found.
   */
  async loadBeforeState(
    resource: string,
    id: string,
    _realmName?: string,
    entityHint?: string,
  ): Promise<Record<string, unknown> | null> {
    const normalized = (entityHint ?? resource)
      .toLowerCase()
      .replace(/^system\./, '');
    try {
      if (normalized.includes('user')) {
        const row = await this.prisma.user.findUnique({
          where: { id },
          select: {
            id: true,
            keycloakId: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            status: true,
            position: true,
            createdAt: true,
            updatedAt: true,
          },
        });
        return row ? (row as unknown as Record<string, unknown>) : null;
      }
      if (normalized.includes('role') || normalized.includes('rbac')) {
        const row = await this.prisma.role.findUnique({
          where: { id },
        });
        return row ? (row as unknown as Record<string, unknown>) : null;
      }
    } catch {
      return null;
    }
    return null;
  }
}
