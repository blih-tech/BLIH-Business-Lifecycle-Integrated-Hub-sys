import { BadRequestException } from '@nestjs/common';
import { ApproveAssetProvisioningUseCase } from './approve-asset-provisioning.usecase';

describe('ApproveAssetProvisioningUseCase', () => {
  it('blocks admin approval until IT supervisor approval exists', async () => {
    const prisma = {
      assetProvisioning: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'asset-1',
          employeeId: 'emp-1',
          itSupervisorApprovedAt: null,
          adminApprovedAt: null,
          financeApprovalRequired: false,
          platformPermissions: null,
          status: 'PENDING',
        }),
        update: jest.fn(),
      },
    };
    const lifecycle = {
      activateEmployeeIfEligible: jest.fn(),
    };

    const useCase = new ApproveAssetProvisioningUseCase(
      prisma as never,
      lifecycle as never,
    );

    await expect(useCase.execute('asset-1', { role: 'ADMIN' })).rejects.toThrow(
      BadRequestException,
    );
    expect(prisma.assetProvisioning.update).not.toHaveBeenCalled();
    expect(lifecycle.activateEmployeeIfEligible).not.toHaveBeenCalled();
  });

  it('activates the employee when admin approval completes a non-finance flow', async () => {
    const approvedAt = new Date('2026-03-01T09:00:00.000Z');
    const prisma = {
      assetProvisioning: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'asset-2',
          employeeId: 'emp-2',
          equipment: [],
          platformPermissions: {},
          itSupervisorApprovedAt: new Date('2026-02-28T09:00:00.000Z'),
          adminApprovedAt: null,
          financeApprovalRequired: false,
          status: 'PENDING',
          createdAt: new Date('2026-02-27T09:00:00.000Z'),
          updatedAt: new Date('2026-02-27T09:00:00.000Z'),
        }),
        update: jest.fn().mockResolvedValue({
          id: 'asset-2',
          employeeId: 'emp-2',
          equipment: [],
          platformPermissions: {},
          itSupervisorApprovedAt: new Date('2026-02-28T09:00:00.000Z'),
          adminApprovedAt: approvedAt,
          financeApprovalRequired: false,
          status: 'APPROVED',
          createdAt: new Date('2026-02-27T09:00:00.000Z'),
          updatedAt: approvedAt,
        }),
      },
    };
    const lifecycle = {
      activateEmployeeIfEligible: jest.fn().mockResolvedValue(undefined),
    };

    const useCase = new ApproveAssetProvisioningUseCase(
      prisma as never,
      lifecycle as never,
    );

    const result = await useCase.execute('asset-2', {
      role: 'ADMIN',
      approvedAt: approvedAt.toISOString(),
    });

    expect(prisma.assetProvisioning.update).toHaveBeenCalledWith({
      where: { id: 'asset-2' },
      data: {
        adminApprovedAt: approvedAt,
        status: 'APPROVED',
      },
    });
    expect(lifecycle.activateEmployeeIfEligible).toHaveBeenCalledWith('emp-2');
    expect(result.status).toBe('APPROVED');
  });
});
